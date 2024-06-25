# Create your views here.
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from .models import Player
from django.contrib.auth.models import User  # Import User model


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, "Logged in successfully!")
            return redirect('/home')
        else:
            messages.error(request, "Username or Password is incorrect!!!")

    return render(request, 'login.html')


def logout_view(request):
    logout(request)
    return redirect('/login')


def home(request):
    return render(request, 'index.html')


@login_required
def rapid(request):
    return render(request, 'rapid.html')


@login_required
def bullet(request):
    return render(request, 'bullet.html')


@login_required
def blitz(request):
    return render(request, 'blitz.html')


@login_required
def bot(request):
    return render(request, 'bot.html')


def register(request):
    if request.method == 'POST':
        name = request.POST['name']
        username = request.POST['username']
        password1 = request.POST['password1']
        password2 = request.POST['password2']

        if password1 == password2:
            if User.objects.filter(username=username).exists():
                messages.error(request, "Username already exists")
                return render(request, 'register.html')
            else:
                user = User.objects.create_user(username=username, password=password1)
                user.save()

                # Create Profile for the new user
                profile = Player.objects.create(user=user, name=name)
                profile.save()

                messages.success(request, "Your account has been created successfully")
                return redirect('/login')
        else:
            messages.error(request, "Both passwords should match!!")

    return render(request, 'register.html')

@login_required
def profile(request):
    # Retrieve the player's profile information
    player = Player.objects.get(user=request.user)

    # Pass the profile information to the template
    context = {
        'player': player
    }

    return render(request, 'profile.html', context)
