# Create your models here.
from django.contrib.auth.models import User,AbstractUser
from django.db import models


class Player(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='profile')
    name = models.CharField(max_length=100)
    rating = models.IntegerField(default=1200)

    def __str__(self):
        return self.user.username




