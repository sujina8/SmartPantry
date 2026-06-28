from django.apps import AppConfig

class FoodConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'food'

    def ready(self):
        # This connects the signals when the app starts
        import food.signals