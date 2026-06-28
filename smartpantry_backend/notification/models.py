from django.db import models
from django.conf import settings

class Notification(models.Model):
    # Notification type choices
    TYPE_CHOICES = [
        ('expiry', 'Expiry Alert'),
        ('donation', 'Donation Update'),
        ('meal', 'Meal Reminder'),
        ('system', 'System Message'),
    ]

    # Link to the user who receives this notification
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='system'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.notification_type} - {self.user.email}'