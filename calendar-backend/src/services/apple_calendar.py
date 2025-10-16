"""
Apple Calendar Integration Service
Handles CalDAV protocol for syncing with iCloud Calendar
"""

import caldav
from datetime import datetime, timedelta
from icalendar import Calendar, Event as ICalEvent
import os
import uuid

class AppleCalendarService:
    """Service for integrating with Apple Calendar via CalDAV"""
    
    CALDAV_URL = 'https://caldav.icloud.com'
    
    def __init__(self):
        pass
    
    def authenticate(self, apple_id, app_specific_password):
        """
        Authenticate with iCloud using app-specific password
        
        Note: Users must generate app-specific password at appleid.apple.com
        
        Args:
            apple_id: User's Apple ID (email)
            app_specific_password: App-specific password from Apple
            
        Returns:
            dict: Authentication credentials
        """
        try:
            # Connect to CalDAV server
            client = caldav.DAVClient(
                url=self.CALDAV_URL,
                username=apple_id,
                password=app_specific_password
            )
            
            # Test connection
            principal = client.principal()
            calendars = principal.calendars()
            
            if calendars:
                return {
                    'success': True,
                    'apple_id': apple_id,
                    'app_password': app_specific_password,
                    'calendars': [cal.name for cal in calendars]
                }
            else:
                return {
                    'success': False,
                    'error': 'No calendars found'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_caldav_client(self, credentials_dict):
        """
        Create CalDAV client from credentials
        
        Args:
            credentials_dict: Dict with apple_id and app_password
            
        Returns:
            caldav.DAVClient: Authenticated CalDAV client
        """
        return caldav.DAVClient(
            url=self.CALDAV_URL,
            username=credentials_dict['apple_id'],
            password=credentials_dict['app_password']
        )
    
    def get_primary_calendar(self, credentials_dict):
        """
        Get user's primary calendar
        
        Args:
            credentials_dict: Authentication credentials
            
        Returns:
            caldav.Calendar: Primary calendar object
        """
        client = self.get_caldav_client(credentials_dict)
        principal = client.principal()
        calendars = principal.calendars()
        
        # Return first calendar (usually primary)
        if calendars:
            return calendars[0]
        return None
    
    def create_event(self, credentials_dict, task_data):
        """
        Create a calendar event from task data
        
        Args:
            credentials_dict: Authentication credentials
            task_data: Dict with task details
            
        Returns:
            dict: Created event data
        """
        try:
            calendar = self.get_primary_calendar(credentials_dict)
            
            if not calendar:
                return {
                    'success': False,
                    'error': 'No calendar found'
                }
            
            # Parse task time
            start_time = datetime.fromisoformat(task_data['scheduled_time'])
            end_time = start_time + timedelta(hours=1)
            
            # Create iCalendar event
            cal = Calendar()
            event = ICalEvent()
            
            event.add('summary', task_data['name'])
            event.add('description', f"Category: {task_data.get('category', 'General')}\nCreated by Get It Done!")
            event.add('dtstart', start_time)
            event.add('dtend', end_time)
            event.add('dtstamp', datetime.utcnow())
            event.add('uid', f"git-{task_data['id']}@getitdone.app")
            
            # Add custom property to identify Get It Done! events
            event.add('x-git-task-id', str(task_data['id']))
            event.add('x-git-source', 'GetItDone')
            
            cal.add_component(event)
            
            # Save event to calendar
            calendar.save_event(cal.to_ical())
            
            return {
                'success': True,
                'event_id': event['uid'],
                'event_data': event.to_ical().decode('utf-8')
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def update_event(self, credentials_dict, event_uid, task_data):
        """
        Update an existing calendar event
        
        Args:
            credentials_dict: Authentication credentials
            event_uid: Event UID
            task_data: Updated task data
            
        Returns:
            dict: Updated event data
        """
        try:
            calendar = self.get_primary_calendar(credentials_dict)
            
            # Find event by UID
            events = calendar.events()
            target_event = None
            
            for event in events:
                ical = Calendar.from_ical(event.data)
                for component in ical.walk():
                    if component.name == 'VEVENT':
                        if component.get('uid') == event_uid:
                            target_event = event
                            break
            
            if not target_event:
                return {
                    'success': False,
                    'error': 'Event not found'
                }
            
            # Parse existing event
            ical = Calendar.from_ical(target_event.data)
            for component in ical.walk():
                if component.name == 'VEVENT':
                    # Update fields
                    if 'name' in task_data:
                        component['summary'] = task_data['name']
                    
                    if 'scheduled_time' in task_data:
                        start_time = datetime.fromisoformat(task_data['scheduled_time'])
                        end_time = start_time + timedelta(hours=1)
                        component['dtstart'] = start_time
                        component['dtend'] = end_time
                    
                    if 'category' in task_data:
                        component['description'] = f"Category: {task_data['category']}\nCreated by Get It Done!"
            
            # Save updated event
            target_event.data = ical.to_ical()
            target_event.save()
            
            return {
                'success': True,
                'event_data': ical.to_ical().decode('utf-8')
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def delete_event(self, credentials_dict, event_uid):
        """
        Delete a calendar event
        
        Args:
            credentials_dict: Authentication credentials
            event_uid: Event UID
            
        Returns:
            dict: Success status
        """
        try:
            calendar = self.get_primary_calendar(credentials_dict)
            
            # Find and delete event
            events = calendar.events()
            
            for event in events:
                ical = Calendar.from_ical(event.data)
                for component in ical.walk():
                    if component.name == 'VEVENT':
                        if component.get('uid') == event_uid:
                            event.delete()
                            return {'success': True}
            
            return {
                'success': False,
                'error': 'Event not found'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_events(self, credentials_dict, time_min=None, time_max=None):
        """
        Fetch events from Apple Calendar
        
        Args:
            credentials_dict: Authentication credentials
            time_min: Start time for event query
            time_max: End time for event query
            
        Returns:
            dict: List of calendar events
        """
        try:
            calendar = self.get_primary_calendar(credentials_dict)
            
            # Default to next 7 days if not specified
            if not time_min:
                time_min = datetime.utcnow()
            else:
                time_min = datetime.fromisoformat(time_min)
                
            if not time_max:
                time_max = datetime.utcnow() + timedelta(days=7)
            else:
                time_max = datetime.fromisoformat(time_max)
            
            # Fetch events in date range
            events = calendar.date_search(start=time_min, end=time_max)
            
            external_events = []
            
            for event in events:
                ical = Calendar.from_ical(event.data)
                for component in ical.walk():
                    if component.name == 'VEVENT':
                        # Skip events created by Get It Done!
                        if component.get('x-git-source') == 'GetItDone':
                            continue
                        
                        external_events.append({
                            'uid': str(component.get('uid')),
                            'summary': str(component.get('summary', 'Untitled')),
                            'description': str(component.get('description', '')),
                            'start': component.get('dtstart').dt.isoformat(),
                            'end': component.get('dtend').dt.isoformat() if component.get('dtend') else None
                        })
            
            return {
                'success': True,
                'events': external_events,
                'count': len(external_events)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def sync_events_to_tasks(self, credentials_dict):
        """
        Sync calendar events to Get It Done! tasks
        
        Args:
            credentials_dict: Authentication credentials
            
        Returns:
            dict: Events formatted as task data
        """
        result = self.get_events(credentials_dict)
        
        if not result['success']:
            return result
        
        tasks = []
        for event in result['events']:
            task = {
                'name': event['summary'],
                'scheduled_time': event['start'],
                'category': 'General',
                'calendar_event_id': event['uid'],
                'calendar_source': 'apple',
            }
            tasks.append(task)
        
        return {
            'success': True,
            'tasks': tasks,
            'count': len(tasks)
        }

