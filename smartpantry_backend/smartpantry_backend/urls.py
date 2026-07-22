from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/inventory/', include('food.urls')),
    path('api/donations/', include('donation.urls')),
    path('api/notifications/', include('notification.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/mealplan/', include('mealplan.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)