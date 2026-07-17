from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/auth/', include('users.urls')),
    path('api/inventory/', include('food.urls')),
    path('api/donations/', include('donation.urls')),
    path('api/notifications/', include('notification.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/mealplan/', include('mealplan.urls')),
]