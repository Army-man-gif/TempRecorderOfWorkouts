from django.db import models
from django.contrib.auth.models import User

# Create your models here.

    
class Workout(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    date = models.DateField(auto_now_add=True)
    
class Exercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE)
    exerciseName = models.CharField(max_length=255)
    exerciseReps = models.CharField(max_length=255)
    exerciseSets = models.CharField(max_length=255)
    exerciseWeight = models.CharField(max_length=255)
    
class ExercisesFromAPI(models.Model):
    exercise_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    gif_url = models.URLField()
    target_muscles = models.JSONField()
    body_parts = models.JSONField()
    equipments = models.JSONField()
    secondary_muscles = models.JSONField()
    instructions = models.JSONField()
    def __str__(self):
        return self.name