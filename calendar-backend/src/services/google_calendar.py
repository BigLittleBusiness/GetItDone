"""
Google Calendar Integration Service
Handles OAuth authentication and calendar sync with Google Calendar API
"""

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime, timedelta
import json
import os

class GoogleCalendarService:
    """Service for integrating with Google Calendar API"""
    
    # OAuth 2.0 scopes required for calendar access
    SCOPES = ['https://www.googleapis.com/auth/calendar']
    
    def __init__(self):
        self.client_config = {
            "web": {
                "client_id": os.getenv('GOOGLE_CLIENT_ID', 'YOUR_CLIENT_ID'),
                "client_secret": os.getenv('GOOGLE_CLIENT_SECRET', 'YOUR_CLIENT_SECRET'),
                "redirect_uris": [os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:5000/api/calendar/google/callback')],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token"
            }
        }
    
    def get_authorization_url(self, user_id):
        """
        Generate OAuth authorization URL for user to grant calendar access
        
        Args:
            user_id: Unique identifier for the user
            
        Returns:
            str: Authorization URL to redirect user to
        """
        flow = Flow.from_client_config(
            self.client_config,
            scopes=self.SCOPES,
            redirect_uri=self.client_config['web']['redirect_uris'][0]
        )
        
        # Add user_id to state for security and user identification
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            state=user_id,
            prompt='consent'  # Force consent screen to get refresh token
        )
        
        return authorization_url, state
    
    def handle_oauth_callback(self, authorization_response, state):
        """
        Handle OAuth callback and exchange authorization code for tokens
        
        Args:
            authorization_response: Full callback URL with authorization code
            state: State parameter (contains user_id)
            
        Returns:
            dict: Credentials dictionary with access_token, refresh_token, etc.
        """
        flow = Flow.from_client_config(
            self.client_config,
            scopes=self.SCOPES,
            redirect_uri=self.client_config['web']['redirect_uris'][0],
            state=state
        )
        
        flow.fetch_token(authorization_response=authorization_response)
        credentials = flow.credentials
        
        return {
            'access_token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes,
            'expiry': credentials.expiry.isoformat() if credentials.expiry else None
        }
    
    def get_calendar_service(self, credentials_dict):
        """
        Build Google Calendar API service from credentials
        
        Args:
            credentials_dict: Dictionary containing OAuth credentials
            
        Returns:
            Resource: Google Calendar API service object
        """
        credentials = Credentials(
            token=credentials_dict['access_token'],
            refresh_token=credentials_dict.get('refresh_token'),
            token_uri=credentials_dict['token_uri'],
            client_id=credentials_dict['client_id'],
            client_secret=credentials_dict['client_secret'],
            scopes=credentials_dict['scopes']
        )
        
        return build('calendar', 'v3', credentials=credentials)
    
    def create_event(self, credentials_dict, task_data):
        """
        Create a calendar event from task data
        
        Args:
            credentials_dict: OAuth credentials
            task_data: Dict with task details (name, time, category, etc.)
            
        Returns:
            dict: Created event data from Google Calendar
        """
        try:
            service = self.get_calendar_service(credentials_dict)
            
            # Parse task time
            start_time = datetime.fromisoformat(task_data['scheduled_time'])
            end_time = start_time + timedelta(hours=1)  # Default 1-hour duration
            
            # Build event object
            event = {
                'summary': task_data['name'],
                'description': f"Category: {task_data.get('category', 'General')}\nCreated by Get It Done!",
                'start': {
                    'dateTime': start_time.isoformat(),
                    'timeZone': task_data.get('timezone', 'UTC'),
                },
                'end': {
                    'dateTime': end_time.isoformat(),
                    'timeZone': task_data.get('timezone', 'UTC'),
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'popup', 'minutes': 15},
                    ],
                },
                # Store Get It Done! task ID in extended properties
                'extendedProperties': {
                    'private': {
                        'gitTaskId': str(task_data['id']),
                        'gitSource': 'GetItDone'
                    }
                }
            }
            
            # Create event in primary calendar
            created_event = service.events().insert(
                calendarId='primary',
                body=event
            ).execute()
            
            return {
                'success': True,
                'event_id': created_event['id'],
                'event_link': created_event.get('htmlLink'),
                'event_data': created_event
            }
            
        except HttpError as error:
            return {
                'success': False,
                'error': str(error)
            }
    
    def update_event(self, credentials_dict, event_id, task_data):
        """
        Update an existing calendar event
        
        Args:
            credentials_dict: OAuth credentials
            event_id: Google Calendar event ID
            task_data: Updated task data
            
        Returns:
            dict: Updated event data
        """
        try:
            service = self.get_calendar_service(credentials_dict)
            
            # Get existing event
            event = service.events().get(
                calendarId='primary',
                eventId=event_id
            ).execute()
            
            # Update event fields
            if 'name' in task_data:
                event['summary'] = task_data['name']
            
            if 'scheduled_time' in task_data:
                start_time = datetime.fromisoformat(task_data['scheduled_time'])
                end_time = start_time + timedelta(hours=1)
                event['start']['dateTime'] = start_time.isoformat()
                event['end']['dateTime'] = end_time.isoformat()
            
            if 'category' in task_data:
                event['description'] = f"Category: {task_data['category']}\nCreated by Get It Done!"
            
            # Update event
            updated_event = service.events().update(
                calendarId='primary',
                eventId=event_id,
                body=event
            ).execute()
            
            return {
                'success': True,
                'event_data': updated_event
            }
            
        except HttpError as error:
            return {
                'success': False,
                'error': str(error)
            }
    
    def delete_event(self, credentials_dict, event_id):
        """
        Delete a calendar event
        
        Args:
            credentials_dict: OAuth credentials
            event_id: Google Calendar event ID
            
        Returns:
            dict: Success status
        """
        try:
            service = self.get_calendar_service(credentials_dict)
            
            service.events().delete(
                calendarId='primary',
                eventId=event_id
            ).execute()
            
            return {'success': True}
            
        except HttpError as error:
            return {
                'success': False,
                'error': str(error)
            }
    
    def get_events(self, credentials_dict, time_min=None, time_max=None):
        """
        Fetch events from Google Calendar
        
        Args:
            credentials_dict: OAuth credentials
            time_min: Start time for event query (ISO format)
            time_max: End time for event query (ISO format)
            
        Returns:
            list: List of calendar events
        """
        try:
            service = self.get_calendar_service(credentials_dict)
            
            # Default to next 7 days if not specified
            if not time_min:
                time_min = datetime.utcnow().isoformat() + 'Z'
            if not time_max:
                time_max = (datetime.utcnow() + timedelta(days=7)).isoformat() + 'Z'
            
            events_result = service.events().list(
                calendarId='primary',
                timeMin=time_min,
                timeMax=time_max,
                maxResults=100,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            # Filter out events already created by Get It Done!
            external_events = [
                event for event in events
                if not event.get('extendedProperties', {}).get('private', {}).get('gitSource')
            ]
            
            return {
                'success': True,
                'events': external_events,
                'count': len(external_events)
            }
            
        except HttpError as error:
            return {
                'success': False,
                'error': str(error)
            }
    
    def sync_events_to_tasks(self, credentials_dict):
        """
        Sync calendar events to Get It Done! tasks
        Fetches events from calendar and returns them for task creation
        
        Args:
            credentials_dict: OAuth credentials
            
        Returns:
            list: Events formatted as task data
        """
        result = self.get_events(credentials_dict)
        
        if not result['success']:
            return result
        
        tasks = []
        for event in result['events']:
            # Convert calendar event to task format
            task = {
                'name': event.get('summary', 'Untitled Event'),
                'scheduled_time': event['start'].get('dateTime', event['start'].get('date')),
                'category': 'General',  # Could parse from description
                'calendar_event_id': event['id'],
                'calendar_source': 'google',
                'calendar_link': event.get('htmlLink')
            }
            tasks.append(task)
        
        return {
            'success': True,
            'tasks': tasks,
            'count': len(tasks)
        }
    
    def setup_webhook(self, credentials_dict, webhook_url):
        """
        Set up webhook for real-time calendar change notifications
        
        Args:
            credentials_dict: OAuth credentials
            webhook_url: URL to receive webhook notifications
            
        Returns:
            dict: Webhook channel information
        """
        try:
            service = self.get_calendar_service(credentials_dict)
            
            # Create watch request
            watch_request = {
                'id': f'git-{datetime.utcnow().timestamp()}',
                'type': 'web_hook',
                'address': webhook_url
            }
            
            channel = service.events().watch(
                calendarId='primary',
                body=watch_request
            ).execute()
            
            return {
                'success': True,
                'channel_id': channel['id'],
                'resource_id': channel['resourceId'],
                'expiration': channel['expiration']
            }
            
        except HttpError as error:
            return {
                'success': False,
                'error': str(error)
            }

