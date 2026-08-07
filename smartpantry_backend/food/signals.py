from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import FoodItem
from notification.models import Notification

@receiver(post_save, sender=FoodItem)
def check_expiry_and_notify(sender, instance, created, **kwargs):
    # Only check when a new food item is added
    if created:
        today = timezone.now().date()
        days_until_expiry = (instance.expiry_date - today).days
        
        # If item expires within 3 days, create a notification
        if days_until_expiry <= 3:
            notification = Notification.objects.create(
                user=instance.user,
                notification_type='expiry',
                title=f'{instance.name} is expiring soon!',
                message=f'Your {instance.name} will expire in {days_until_expiry} days. Use it before it goes to waste!'
            )

            # Push it live over WebSocket to this user's group
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'notifications_{instance.user.id}',
                {
                    'type': 'send_notification',
                    'id': notification.id,
                    'title': notification.title,
                    'message': notification.message,
                    'notification_type': notification.notification_type,
                    'created_at': notification.created_at.isoformat(),
                    'is_read': notification.is_read,
                }
            )