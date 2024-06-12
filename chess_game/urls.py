from django.urls import path
from .views import home, chess_game, register, profile, login_view, logout_view
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', home, name='home'),
    path('home/', home, name='home'),
    path('register/', register, name='register'),
    path('profile/', profile, name='profile'),
    path('chess_game/', chess_game, name='chess_game'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
]
