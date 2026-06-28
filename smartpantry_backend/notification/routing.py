from django.urls import re_path
from . import consumers

# WebSocket URL - frontend connects to ws://localhost:8000/ws/notifications/
websocket_urlpatterns = [
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
]