from django.db import models
from django.contrib.auth.models import User

# Create your models here.

    
class Workout(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    
class Exercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE)
    exerciseName = models.CharField(max_length=255)
    exerciseReps = models.CharField(max_length=255)
    exerciseSets = models.CharField(max_length=255)
    exerciseWeight = models.CharField(max_length=255)