"""
API routes for calendar integration
"""

from flask import Blueprint, request, jsonify, redirect
from src.services.google_calendar import GoogleCalendarService
from src.services.outlook_calendar import OutlookCalendarService
from src.services.apple_calendar import AppleCalendarService
from src.models.calendar import CalendarConnection, CalendarSync, WebhookSubscription
from src.database import db
from datetime import datetime

calendar_bp = Blueprint('calendar', __name__, url_prefix='/api/calendar')

# Initialize calendar services
google_service = GoogleCalendarService()
outlook_service = OutlookCalendarService()
apple_service = AppleCalendarService()


@calendar_bp.route('/connect/<calendar_type>', methods=['POST'])
def connect_calendar(calendar_type):
    """
    Initiate calendar connection flow
    
    Request body:
        user_id: User's unique identifier
    
    Returns:
        authorization_url: URL to redirect user for OAuth
    """
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    if calendar_type == 'google':
        auth_url, state = google_service.get_authorization_url(user_id)
        return jsonify({
            'authorization_url': auth_url,
            'state': state,
            'calendar_type': 'google'
        })
    
    elif calendar_type == 'outlook':
        auth_url, state = outlook_service.get_authorization_url(user_id)
        return jsonify({
            'authorization_url': auth_url,
            'state': state,
            'calendar_type': 'outlook'
        })
    
    elif calendar_type == 'apple':
        # Apple Calendar requires username/password (app-specific password)
        return jsonify({
            'message': 'Apple Calendar requires app-specific password',
            'instructions': 'Generate app-specific password at appleid.apple.com',
            'calendar_type': 'apple'
        })
    
    else:
        return jsonify({'error': 'Invalid calendar type'}), 400


@calendar_bp.route('/google/callback', methods=['GET'])
def google_callback():
    """Handle Google OAuth callback"""
    authorization_response = request.url
    state = request.args.get('state')  # This is the user_id
    
    if not state:
        return jsonify({'error': 'Missing state parameter'}), 400
    
    # Exchange authorization code for credentials
    credentials = google_service.handle_oauth_callback(authorization_response, state)
    
    if 'error' in credentials:
        return jsonify({'error': credentials['error']}), 400
    
    # Save credentials to database
    existing = CalendarConnection.query.filter_by(
        user_id=state,
        calendar_type='google'
    ).first()
    
    if existing:
        existing.update_credentials(credentials)
    else:
        connection = CalendarConnection(
            user_id=state,
            calendar_type='google',
            credentials=credentials
        )
        db.session.add(connection)
    
    db.session.commit()
    
    # Redirect to success page
    return redirect(f'/calendar-connected?type=google&status=success')


@calendar_bp.route('/outlook/callback', methods=['GET'])
def outlook_callback():
    """Handle Outlook OAuth callback"""
    code = request.args.get('code')
    state = request.args.get('state')  # This is the user_id
    
    if not code or not state:
        return jsonify({'error': 'Missing code or state parameter'}), 400
    
    # Exchange authorization code for credentials
    credentials = outlook_service.handle_oauth_callback(code, state)
    
    if 'error' in credentials:
        return jsonify({'error': credentials['error']}), 400
    
    # Save credentials to database
    existing = CalendarConnection.query.filter_by(
        user_id=state,
        calendar_type='outlook'
    ).first()
    
    if existing:
        existing.update_credentials(credentials)
    else:
        connection = CalendarConnection(
            user_id=state,
            calendar_type='outlook',
            credentials=credentials
        )
        db.session.add(connection)
    
    db.session.commit()
    
    # Redirect to success page
    return redirect(f'/calendar-connected?type=outlook&status=success')


@calendar_bp.route('/apple/connect', methods=['POST'])
def apple_connect():
    """Connect Apple Calendar with app-specific password"""
    data = request.json
    user_id = data.get('user_id')
    apple_id = data.get('apple_id')
    app_password = data.get('app_password')
    
    if not all([user_id, apple_id, app_password]):
        return jsonify({'error': 'user_id, apple_id, and app_password are required'}), 400
    
    # Test authentication
    result = apple_service.authenticate(apple_id, app_password)
    
    if not result['success']:
        return jsonify({'error': result['error']}), 401
    
    # Save credentials
    credentials = {
        'apple_id': apple_id,
        'app_password': app_password
    }
    
    existing = CalendarConnection.query.filter_by(
        user_id=user_id,
        calendar_type='apple'
    ).first()
    
    if existing:
        existing.update_credentials(credentials)
    else:
        connection = CalendarConnection(
            user_id=user_id,
            calendar_type='apple',
            credentials=credentials
        )
        db.session.add(connection)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Apple Calendar connected successfully',
        'calendars': result.get('calendars', [])
    })


@calendar_bp.route('/task-to-calendar', methods=['POST'])
def sync_task_to_calendar():
    """
    Sync a Get It Done! task to user's calendar
    
    Request body:
        user_id: User's unique identifier
        task_data: Task details (name, scheduled_time, category, etc.)
    """
    data = request.json
    user_id = data.get('user_id')
    task_data = data.get('task_data')
    
    if not user_id or not task_data:
        return jsonify({'error': 'user_id and task_data are required'}), 400
    
    # Get user's calendar connection
    connection = CalendarConnection.query.filter_by(
        user_id=user_id,
        is_active=True
    ).first()
    
    if not connection:
        return jsonify({'error': 'No calendar connected'}), 404
    
    credentials = connection.get_credentials()
    calendar_type = connection.calendar_type
    
    # Create sync record
    sync = CalendarSync(
        user_id=user_id,
        calendar_type=calendar_type,
        sync_direction='to_calendar',
        task_id=task_data.get('id')
    )
    db.session.add(sync)
    db.session.commit()
    
    # Create event in calendar
    try:
        if calendar_type == 'google':
            result = google_service.create_event(credentials, task_data)
        elif calendar_type == 'outlook':
            result = outlook_service.create_event(credentials, task_data)
        elif calendar_type == 'apple':
            result = apple_service.create_event(credentials, task_data)
        else:
            return jsonify({'error': 'Invalid calendar type'}), 400
        
        if result['success']:
            sync.mark_success(calendar_event_id=result['event_id'])
            db.session.commit()
            return jsonify({
                'success': True,
                'event_id': result['event_id'],
                'event_link': result.get('event_link')
            })
        else:
            sync.mark_failed(str(result.get('error')))
            db.session.commit()
            return jsonify({'error': result.get('error')}), 500
            
    except Exception as e:
        sync.mark_failed(str(e))
        db.session.commit()
        return jsonify({'error': str(e)}), 500


@calendar_bp.route('/calendar-to-tasks', methods=['POST'])
def sync_calendar_to_tasks():
    """
    Sync calendar events to Get It Done! tasks
    
    Request body:
        user_id: User's unique identifier
    """
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    # Get user's calendar connection
    connection = CalendarConnection.query.filter_by(
        user_id=user_id,
        is_active=True
    ).first()
    
    if not connection:
        return jsonify({'error': 'No calendar connected'}), 404
    
    credentials = connection.get_credentials()
    calendar_type = connection.calendar_type
    
    # Fetch events from calendar
    try:
        if calendar_type == 'google':
            result = google_service.sync_events_to_tasks(credentials)
        elif calendar_type == 'outlook':
            result = outlook_service.sync_events_to_tasks(credentials)
        elif calendar_type == 'apple':
            result = apple_service.sync_events_to_tasks(credentials)
        else:
            return jsonify({'error': 'Invalid calendar type'}), 400
        
        if result['success']:
            # Create sync records for each task
            for task in result['tasks']:
                sync = CalendarSync(
                    user_id=user_id,
                    calendar_type=calendar_type,
                    sync_direction='from_calendar',
                    calendar_event_id=task['calendar_event_id']
                )
                sync.mark_success()
                db.session.add(sync)
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'tasks': result['tasks'],
                'count': result['count']
            })
        else:
            return jsonify({'error': result.get('error')}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@calendar_bp.route('/update-event', methods=['PUT'])
def update_calendar_event():
    """
    Update a calendar event
    
    Request body:
        user_id: User's unique identifier
        event_id: Calendar event ID
        task_data: Updated task data
    """
    data = request.json
    user_id = data.get('user_id')
    event_id = data.get('event_id')
    task_data = data.get('task_data')
    
    if not all([user_id, event_id, task_data]):
        return jsonify({'error': 'user_id, event_id, and task_data are required'}), 400
    
    # Get user's calendar connection
    connection = CalendarConnection.query.filter_by(
        user_id=user_id,
        is_active=True
    ).first()
    
    if not connection:
        return jsonify({'error': 'No calendar connected'}), 404
    
    credentials = connection.get_credentials()
    calendar_type = connection.calendar_type
    
    # Update event
    try:
        if calendar_type == 'google':
            result = google_service.update_event(credentials, event_id, task_data)
        elif calendar_type == 'outlook':
            result = outlook_service.update_event(credentials, event_id, task_data)
        elif calendar_type == 'apple':
            result = apple_service.update_event(credentials, event_id, task_data)
        else:
            return jsonify({'error': 'Invalid calendar type'}), 400
        
        if result['success']:
            return jsonify({'success': True})
        else:
            return jsonify({'error': result.get('error')}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@calendar_bp.route('/delete-event', methods=['DELETE'])
def delete_calendar_event():
    """
    Delete a calendar event
    
    Request body:
        user_id: User's unique identifier
        event_id: Calendar event ID
    """
    data = request.json
    user_id = data.get('user_id')
    event_id = data.get('event_id')
    
    if not all([user_id, event_id]):
        return jsonify({'error': 'user_id and event_id are required'}), 400
    
    # Get user's calendar connection
    connection = CalendarConnection.query.filter_by(
        user_id=user_id,
        is_active=True
    ).first()
    
    if not connection:
        return jsonify({'error': 'No calendar connected'}), 404
    
    credentials = connection.get_credentials()
    calendar_type = connection.calendar_type
    
    # Delete event
    try:
        if calendar_type == 'google':
            result = google_service.delete_event(credentials, event_id)
        elif calendar_type == 'outlook':
            result = outlook_service.delete_event(credentials, event_id)
        elif calendar_type == 'apple':
            result = apple_service.delete_event(credentials, event_id)
        else:
            return jsonify({'error': 'Invalid calendar type'}), 400
        
        if result['success']:
            return jsonify({'success': True})
        else:
            return jsonify({'error': result.get('error')}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@calendar_bp.route('/connection-status/<user_id>', methods=['GET'])
def get_connection_status(user_id):
    """Get user's calendar connection status"""
    connection = CalendarConnection.query.filter_by(
        user_id=user_id,
        is_active=True
    ).first()
    
    if connection:
        return jsonify({
            'connected': True,
            'calendar_type': connection.calendar_type,
            'connected_at': connection.created_at.isoformat()
        })
    else:
        return jsonify({
            'connected': False
        })


@calendar_bp.route('/disconnect/<user_id>', methods=['POST'])
def disconnect_calendar(user_id):
    """Disconnect user's calendar"""
    connection = CalendarConnection.query.filter_by(
        user_id=user_id,
        is_active=True
    ).first()
    
    if connection:
        connection.is_active = False
        db.session.commit()
        return jsonify({'success': True, 'message': 'Calendar disconnected'})
    else:
        return jsonify({'error': 'No active connection found'}), 404


@calendar_bp.route('/sync-history/<user_id>', methods=['GET'])
def get_sync_history(user_id):
    """Get user's calendar sync history"""
    syncs = CalendarSync.query.filter_by(user_id=user_id).order_by(
        CalendarSync.created_at.desc()
    ).limit(50).all()
    
    return jsonify({
        'syncs': [sync.to_dict() for sync in syncs],
        'count': len(syncs)
    })

