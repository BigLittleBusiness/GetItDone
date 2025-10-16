"""
Database models for calendar integration
"""

from src.database import db
from datetime import datetime
import json

class CalendarConnection(db.Model):
    """Store user calendar connection credentials"""
    __tablename__ = 'calendar_connections'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False, index=True)
    calendar_type = db.Column(db.String(20), nullable=False)  # 'google', 'outlook', 'apple'
    credentials = db.Column(db.Text, nullable=False)  # JSON string of credentials
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, user_id, calendar_type, credentials):
        self.user_id = user_id
        self.calendar_type = calendar_type
        self.credentials = json.dumps(credentials)
    
    def get_credentials(self):
        """Get credentials as dictionary"""
        return json.loads(self.credentials)
    
    def update_credentials(self, new_credentials):
        """Update credentials"""
        self.credentials = json.dumps(new_credentials)
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'calendar_type': self.calendar_type,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class CalendarSync(db.Model):
    """Track calendar sync events and mappings"""
    __tablename__ = 'calendar_syncs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False, index=True)
    task_id = db.Column(db.String(100), nullable=True)  # Get It Done! task ID
    calendar_event_id = db.Column(db.String(200), nullable=True)  # Calendar provider's event ID
    calendar_type = db.Column(db.String(20), nullable=False)
    sync_direction = db.Column(db.String(20), nullable=False)  # 'to_calendar', 'from_calendar'
    sync_status = db.Column(db.String(20), default='pending')  # 'pending', 'success', 'failed'
    error_message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, user_id, calendar_type, sync_direction, task_id=None, calendar_event_id=None):
        self.user_id = user_id
        self.task_id = task_id
        self.calendar_event_id = calendar_event_id
        self.calendar_type = calendar_type
        self.sync_direction = sync_direction
    
    def mark_success(self, task_id=None, calendar_event_id=None):
        """Mark sync as successful"""
        self.sync_status = 'success'
        if task_id:
            self.task_id = task_id
        if calendar_event_id:
            self.calendar_event_id = calendar_event_id
    
    def mark_failed(self, error_message):
        """Mark sync as failed"""
        self.sync_status = 'failed'
        self.error_message = error_message
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'task_id': self.task_id,
            'calendar_event_id': self.calendar_event_id,
            'calendar_type': self.calendar_type,
            'sync_direction': self.sync_direction,
            'sync_status': self.sync_status,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat()
        }


class WebhookSubscription(db.Model):
    """Track webhook subscriptions for real-time sync"""
    __tablename__ = 'webhook_subscriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False, index=True)
    calendar_type = db.Column(db.String(20), nullable=False)
    subscription_id = db.Column(db.String(200), nullable=False)  # Provider's subscription ID
    channel_id = db.Column(db.String(200), nullable=True)  # For Google
    resource_id = db.Column(db.String(200), nullable=True)  # For Google
    expiration = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, user_id, calendar_type, subscription_id, expiration, channel_id=None, resource_id=None):
        self.user_id = user_id
        self.calendar_type = calendar_type
        self.subscription_id = subscription_id
        self.channel_id = channel_id
        self.resource_id = resource_id
        self.expiration = expiration
    
    def is_expired(self):
        """Check if subscription has expired"""
        return datetime.utcnow() > self.expiration
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'calendar_type': self.calendar_type,
            'subscription_id': self.subscription_id,
            'expiration': self.expiration.isoformat(),
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

