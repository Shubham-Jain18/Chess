from django.urls import path
from .views import home, rapid, bullet, blitz, bot, register, profile, login_view, logout_view
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', home, name='home'),
    path('home/', home, name='home'),
    path('register/', register, name='register'),
    path('profile/', profile, name='profile'),
    path('rapid/', rapid, name='rapid'),
    path('bullet/', bullet, name='bullet'),
    path('blitz/', blitz, name='blitz'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('bot/', bot, name='bot'),
]
