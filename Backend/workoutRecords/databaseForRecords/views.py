from django.shortcuts import render
from django.middleware.csrf import get_token
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.models import User
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.hashers import check_password
import traceback
import json
import datetime
from .models import Workout,Exercise

def records_home(request):
    return HttpResponse("Records root works!")
# Create your views here.
def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({"csrftoken": token})

@ensure_csrf_cookie
@require_GET
def setToken(request):
    # Sets the cookie on the frontend device
    return JsonResponse({"detail":"CSRF token set"})



def GetorMakeUser(request):
    if(request.method == "POST"):
        try:
            data = json.loads(request.body)
            username = data.get("username")
            passkey = data.get("passkey")
            user,created = User.objects.get_or_create(username=username)
            if created:
                user.set_password(passkey)
            user.save()
            message = "User created" if created else "User fetched"
            userDataToReturn = {"username":user.username,"passkey":passkey,"status":message}
            return JsonResponse(userDataToReturn)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error":str(e)},status=400)
    return JsonResponse({"error": "Only POST allowed"}, status=405)


def validateUser(request,username="",passkey=""):
    print("B4 entering logic",username,passkey)
    if(request.method == "POST"):
        try:
            data = json.loads(request.body)
            username = data.get("username","")
            passkey = data.get("passkey","")
            print("After entering logic",username,passkey)
            user = authenticate(request,username=username,password=passkey)
            if(user is not None):
                return JsonResponse({"message":"User validated"})
        except User.DoesNotExist:
            return JsonResponse({"error": "User does not exist"}, status=405)
        except Exception as e:
            return JsonResponse({"error":str(e)},status=400)
    else:
        try:
            user = authenticate(request,username=username,password=passkey)
            if(user is not None):
                return True
        except Exception:
            return False

def deleteUser(request):
    if(request.method == "POST"):
        try:
            data = json.loads(request.body)
            username = data.get("username","")
            passkey = data.get("passkey","")
            if(validateUser(request,username,passkey)):
                user = User.objects.get(username=username)
                if(check_password(passkey,user.password)):
                    user.delete()
                    return JsonResponse({"message":"Deleted user"})
                return JsonResponse({"error":"Wrong password"})
            return JsonResponse({"error": "User does not exist"}, status=405)
        except Exception as e:
            return JsonResponse({"error":str(e)},status=400)
    return JsonResponse({"error": "Only POST allowed"}, status=405)

# ----------------------------------------------------------------------------------------

def loginView(request):
    print(request.method)
    if(request.method == "POST"):
        try:
            data = json.loads(request.body)
            username = data.get("username")
            passkey = data.get("passkey")
            if(validateUser(request,username,passkey)):
                user = User.objects.get(username=username)
                if(check_password(passkey,user.password)):
                    login(request, user)
                    return JsonResponse({"message":"User logged in"})
                return JsonResponse({"error":"Wrong password"})
            return JsonResponse({"error": "User not found"}, status=404)
        except User.DoesNotExist:
            return JsonResponse({"error": "User does not exist"}, status=404)
        except Exception as e:
            return JsonResponse({"error":str(e)},status=400)
    return JsonResponse({"error": "Only POST allowed"}, status=405)

def logoutView(request):
    if request.user.is_authenticated:
        logout(request)
        return JsonResponse({"message": "User logged out"})
    return JsonResponse({"error":"User not logged in yet"})


# ----------------------------------------------------------------------------------------

def updateExercise(request):
    if request.user.is_authenticated:
        if(request.method == "POST"):
            try:
                data = json.loads(request.body)
                workoutName = data.get("workoutName")
                exerciseName = data.get("exerciseName", "")
                exerciseReps = data.get("exerciseReps",None)
                exerciseSets = data.get("exerciseSets",None)
                exerciseWeight = data.get("exerciseWeight",None)
                workout, _ = Workout.objects.get_or_create(user=request.user, name=workoutName)
                # defaults are only used when the creation aspect of "get_or_create" is triggered
                exercise,created = Exercise.objects.get_or_create(workout=workout, exerciseName=exerciseName,
                defaults={
                    "exerciseReps":exerciseReps, 
                    "exerciseSets":exerciseSets,
                    "exerciseWeight":exerciseWeight
                }
                )
                if not created:
                    for field in ["exerciseReps","exerciseSets","exerciseWeight"]:
                        value = data.get(field)
                        if value is not None:
                            setattr(exercise, field, value)
                message = "Exercise created" if created else "Exercise updated"
                return JsonResponse({"message": message})
            except Exception as e:
                return JsonResponse({"error": str(e)}, status=400)
        return JsonResponse({"message":"Only POST method allowed"})
    return JsonResponse({"message":"User not logged in"})


def deleteExercise(request):
    if request.user.is_authenticated:
        if(request.method == "POST"):
            data = json.loads(request.body)
            workout = data.get("workout")
            exerciseName = data.get("exerciseName")
            exercise = Exercise.objects.get(workout=workout, exerciseName=exerciseName)
            exercise.delete()
            return JsonResponse({"message": "Exercise deleted"})
        return JsonResponse({"message":"Only POST method allowed"})
    return JsonResponse({"message":"User not logged in"})

# ----------------------------------------------------------------------------------------


def addWorkout(request):
    if request.user.is_authenticated:
        if(request.method == "POST"):
            data = json.loads(request.body)
            newName = data.get("newName")
            workout = Workout(user=request.user, name=newName)
            workout.save()
            return JsonResponse({"message": "Workout created"})
        return JsonResponse({"message":"Only POST method allowed"})
    return JsonResponse({"message":"User not logged in"})

def updateWorkout(request):
    if request.user.is_authenticated:
        if(request.method == "POST"):
            try:
                data = json.loads(request.body)
                originalName = data.get("originalName")
                newName = data.get("newName")
                workout = Workout.objects.get(user=request.user,name=originalName)
                workout.name = newName
                workout.save()
                return JsonResponse({"message": "Workout updated"})
            except Workout.DoesNotExist:
                return addWorkout(request)
        return JsonResponse({"message":"Only POST method allowed"})
    return JsonResponse({"message":"User not logged in"})


def deleteWorkout(request):
    if request.user.is_authenticated:
        if(request.method == "POST"):
            data = json.loads(request.body)
            workoutName = data.get("workoutName")
            workout = Workout(user=request.user,name=workoutName)
            workout.delete()
            return JsonResponse({"message": "Workout deleted"})
        return JsonResponse({"message":"Only POST method allowed"})
    return JsonResponse({"message":"User not logged in"})


def getAllExercisesbasedOnDate(request):
    if request.user.is_authenticated:
        if(request.method == "POST"):
            try:
                data = json.loads(request.body)
                date = data.get("date")
                date_obj = datetime.datetime.strptime(date, "%Y-%m-%d").date()
                exercises = Exercise.objects.filter(workout__user=request.user,workout__date=date_obj)

                toReturn = {}
                for exercise in exercises:
                    workoutName = exercise.workout.name
                    exerciseName = exercise.exerciseName
                    if workoutName not in toReturn:
                        toReturn[workoutName] = []
                    toReturn[workoutName].append({
                        "name" : exerciseName,
                        "reps" : exercise.exerciseReps,
                        "sets" : exercise.exerciseSets,
                        "weight" : exercise.exerciseWeight 
                    })
                return JsonResponse({"message":"success","data":toReturn})
            except Exception as e:
                return JsonResponse({"error":str(e)},status=400)
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    return JsonResponse({"message":"User not logged in"})

