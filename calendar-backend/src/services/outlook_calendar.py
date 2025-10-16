"""
Outlook Calendar Integration Service
Handles OAuth authentication and calendar sync with Microsoft Graph API
"""

import requests
from datetime import datetime, timedelta
import os

class OutlookCalendarService:
    """Service for integrating with Outlook Calendar via Microsoft Graph API"""
    
    # OAuth 2.0 configuration
    AUTHORITY = 'https://login.microsoftonline.com/common'
    SCOPES = ['Calendars.ReadWrite', 'offline_access']
    GRAPH_API_ENDPOINT = 'https://graph.microsoft.com/v1.0'
    
    def __init__(self):
        self.client_id = os.getenv('MICROSOFT_CLIENT_ID', 'YOUR_CLIENT_ID')
        self.client_secret = os.getenv('MICROSOFT_CLIENT_SECRET', 'YOUR_CLIENT_SECRET')
        self.redirect_uri = os.getenv('MICROSOFT_REDIRECT_URI', 'http://localhost:5000/api/calendar/outlook/callback')
    
    def get_authorization_url(self, user_id):
        """
        Generate OAuth authorization URL for user to grant calendar access
        
        Args:
            user_id: Unique identifier for the user
            
        Returns:
            tuple: (authorization_url, state)
        """
        auth_url = (
            f"{self.AUTHORITY}/oauth2/v2.0/authorize?"
            f"client_id={self.client_id}&"
            f"response_type=code&"
            f"redirect_uri={self.redirect_uri}&"
            f"response_mode=query&"
            f"scope={' '.join(self.SCOPES)}&"
            f"state={user_id}"
        )
        
        return auth_url, user_id
    
    def handle_oauth_callback(self, authorization_code, state):
        """
        Exchange authorization code for access token
        
        Args:
            authorization_code: Authorization code from callback
            state: State parameter (contains user_id)
            
        Returns:
            dict: Credentials dictionary with access_token, refresh_token, etc.
        """
        token_url = f"{self.AUTHORITY}/oauth2/v2.0/token"
        
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': authorization_code,
            'redirect_uri': self.redirect_uri,
            'grant_type': 'authorization_code',
            'scope': ' '.join(self.SCOPES)
        }
        
        response = requests.post(token_url, data=data)
        
        if response.status_code == 200:
            token_data = response.json()
            return {
                'access_token': token_data['access_token'],
                'refresh_token': token_data.get('refresh_token'),
                'expires_in': token_data['expires_in'],
                'token_type': token_data['token_type'],
                'scope': token_data['scope']
            }
        else:
            return {
                'error': response.json()
            }
    
    def refresh_access_token(self, refresh_token):
        """
        Refresh expired access token
        
        Args:
            refresh_token: Refresh token
            
        Returns:
            dict: New credentials
        """
        token_url = f"{self.AUTHORITY}/oauth2/v2.0/token"
        
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token',
            'scope': ' '.join(self.SCOPES)
        }
        
        response = requests.post(token_url, data=data)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {'error': response.json()}
    
    def _get_headers(self, access_token):
        """Get authorization headers for API requests"""
        return {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    
    def create_event(self, credentials_dict, task_data):
        """
        Create a calendar event from task data
        
        Args:
            credentials_dict: OAuth credentials
            task_data: Dict with task details
            
        Returns:
            dict: Created event data
        """
        url = f"{self.GRAPH_API_ENDPOINT}/me/calendar/events"
        headers = self._get_headers(credentials_dict['access_token'])
        
        # Parse task time
        start_time = datetime.fromisoformat(task_data['scheduled_time'])
        end_time = start_time + timedelta(hours=1)
        
        # Build event object
        event = {
            'subject': task_data['name'],
            'body': {
                'contentType': 'Text',
                'content': f"Category: {task_data.get('category', 'General')}\nCreated by Get It Done!"
            },
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': task_data.get('timezone', 'UTC')
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': task_data.get('timezone', 'UTC')
            },
            'isReminderOn': True,
            'reminderMinutesBeforeStart': 15,
            # Store Get It Done! task ID in extended properties
            'singleValueExtendedProperties': [
                {
                    'id': 'String {66f5a359-4659-4830-9070-00047ec6ac6e} Name gitTaskId',
                    'value': str(task_data['id'])
                },
                {
                    'id': 'String {66f5a359-4659-4830-9070-00047ec6ac6e} Name gitSource',
                    'value': 'GetItDone'
                }
            ]
        }
        
        response = requests.post(url, headers=headers, json=event)
        
        if response.status_code == 201:
            created_event = response.json()
            return {
                'success': True,
                'event_id': created_event['id'],
                'event_link': created_event.get('webLink'),
                'event_data': created_event
            }
        else:
            return {
                'success': False,
                'error': response.json()
            }
    
    def update_event(self, credentials_dict, event_id, task_data):
        """
        Update an existing calendar event
        
        Args:
            credentials_dict: OAuth credentials
            event_id: Outlook event ID
            task_data: Updated task data
            
        Returns:
            dict: Updated event data
        """
        url = f"{self.GRAPH_API_ENDPOINT}/me/calendar/events/{event_id}"
        headers = self._get_headers(credentials_dict['access_token'])
        
        # Build update object
        update = {}
        
        if 'name' in task_data:
            update['subject'] = task_data['name']
        
        if 'scheduled_time' in task_data:
            start_time = datetime.fromisoformat(task_data['scheduled_time'])
            end_time = start_time + timedelta(hours=1)
            update['start'] = {
                'dateTime': start_time.isoformat(),
                'timeZone': task_data.get('timezone', 'UTC')
            }
            update['end'] = {
                'dateTime': end_time.isoformat(),
                'timeZone': task_data.get('timezone', 'UTC')
            }
        
        if 'category' in task_data:
            update['body'] = {
                'contentType': 'Text',
                'content': f"Category: {task_data['category']}\nCreated by Get It Done!"
            }
        
        response = requests.patch(url, headers=headers, json=update)
        
        if response.status_code == 200:
            return {
                'success': True,
                'event_data': response.json()
            }
        else:
            return {
                'success': False,
                'error': response.json()
            }
    
    def delete_event(self, credentials_dict, event_id):
        """
        Delete a calendar event
        
        Args:
            credentials_dict: OAuth credentials
            event_id: Outlook event ID
            
        Returns:
            dict: Success status
        """
        url = f"{self.GRAPH_API_ENDPOINT}/me/calendar/events/{event_id}"
        headers = self._get_headers(credentials_dict['access_token'])
        
        response = requests.delete(url, headers=headers)
        
        if response.status_code == 204:
            return {'success': True}
        else:
            return {
                'success': False,
                'error': response.json() if response.content else 'Unknown error'
            }
    
    def get_events(self, credentials_dict, time_min=None, time_max=None):
        """
        Fetch events from Outlook Calendar
        
        Args:
            credentials_dict: OAuth credentials
            time_min: Start time for event query (ISO format)
            time_max: End time for event query (ISO format)
            
        Returns:
            dict: List of calendar events
        """
        url = f"{self.GRAPH_API_ENDPOINT}/me/calendar/events"
        headers = self._get_headers(credentials_dict['access_token'])
        
        # Default to next 7 days if not specified
        if not time_min:
            time_min = datetime.utcnow().isoformat()
        if not time_max:
            time_max = (datetime.utcnow() + timedelta(days=7)).isoformat()
        
        # Build query parameters
        params = {
            '$filter': f"start/dateTime ge '{time_min}' and start/dateTime le '{time_max}'",
            '$orderby': 'start/dateTime',
            '$top': 100,
            '$expand': 'singleValueExtendedProperties($filter=id eq \'String {66f5a359-4659-4830-9070-00047ec6ac6e} Name gitSource\')'
        }
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            events_data = response.json()
            events = events_data.get('value', [])
            
            # Filter out events created by Get It Done!
            external_events = [
                event for event in events
                if not any(
                    prop.get('value') == 'GetItDone'
                    for prop in event.get('singleValueExtendedProperties', [])
                )
            ]
            
            return {
                'success': True,
                'events': external_events,
                'count': len(external_events)
            }
        else:
            return {
                'success': False,
                'error': response.json()
            }
    
    def sync_events_to_tasks(self, credentials_dict):
        """
        Sync calendar events to Get It Done! tasks
        
        Args:
            credentials_dict: OAuth credentials
            
        Returns:
            dict: Events formatted as task data
        """
        result = self.get_events(credentials_dict)
        
        if not result['success']:
            return result
        
        tasks = []
        for event in result['events']:
            task = {
                'name': event.get('subject', 'Untitled Event'),
                'scheduled_time': event['start']['dateTime'],
                'category': 'General',
                'calendar_event_id': event['id'],
                'calendar_source': 'outlook',
                'calendar_link': event.get('webLink')
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
            dict: Subscription information
        """
        url = f"{self.GRAPH_API_ENDPOINT}/subscriptions"
        headers = self._get_headers(credentials_dict['access_token'])
        
        # Create subscription
        subscription = {
            'changeType': 'created,updated,deleted',
            'notificationUrl': webhook_url,
            'resource': '/me/calendar/events',
            'expirationDateTime': (datetime.utcnow() + timedelta(days=3)).isoformat() + 'Z',
            'clientState': 'GetItDoneSecret'
        }
        
        response = requests.post(url, headers=headers, json=subscription)
        
        if response.status_code == 201:
            sub_data = response.json()
            return {
                'success': True,
                'subscription_id': sub_data['id'],
                'expiration': sub_data['expirationDateTime']
            }
        else:
            return {
                'success': False,
                'error': response.json()
            }

