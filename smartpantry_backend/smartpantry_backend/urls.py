from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/inventory/', include('food.urls')),
    path('api/donations/', include('donation.urls')),
    path('api/notifications/', include('notification.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/mealplan/', include('mealplan.urls')),
]