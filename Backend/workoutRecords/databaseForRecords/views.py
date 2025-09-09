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
from datetime import datetime
from .models import Workout,Exercise
import re
def records_home(request):
    return HttpResponse("Records root works!")
# Create your views here.
def get_csrf_token(request):
    token = get_token(request)
    response = JsonResponse({'csrftoken': token})
    response.set_cookie(
        'csrftoken', token, samesite='None', secure=True, httponly=False
    )
    return response

@ensure_csrf_cookie
@require_GET
def setToken(request):
    # Sets the cookie on the frontend device
    return JsonResponse({"detail":"CSRF token set"})



def GetorMakeUser(request):
    if(request.method != "POST"):
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    else:
        try:
            data = json.loads(request.body)
            username = data.get("username")
            passkey = data.get("passkey")
            user,created = User.objects.get_or_create(username=username)
            if created:
                user.set_password(passkey)
            user.save()
            login(request, user)
            if not request.session.session_key:
                request.session.save()
            sessionid = request.session.session_key
            csrftoken = get_token(request)
            message = "User created and logged in" if created else "User fetched and logged in"
            userDataToReturn = {"username":user.username,"passkey":passkey,"sessionid":sessionid,"csrftoken":csrftoken,"status":message}
            return JsonResponse(userDataToReturn)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error":str(e)},status=400)


def validateUser(request,username="",passkey=""):
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
    if(request.method != "POST"):
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    else:
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

# ----------------------------------------------------------------------------------------

def loginView(request):
    if(request.method != "POST"):
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    else:
        try:
            data = json.loads(request.body)
            username = data.get("username")
            passkey = data.get("passkey")
            user = User.objects.get(username=username)
            if(check_password(passkey,user.password)):
                login(request, user)
                if not request.session.session_key:
                    request.session.save()
                sessionid = request.session.session_key
                csrftoken = get_token(request)
                return JsonResponse({"message":"User logged in","sessionid":sessionid,"csrftoken":csrftoken})
            return JsonResponse({"error":"Wrong password"})
        except User.DoesNotExist:
            return JsonResponse({"error": "User does not exist"}, status=404)
        except Exception as e:
            return JsonResponse({"error":str(e)},status=400)

def logoutView(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error":"User not logged in yet"})
    else:
        logout(request)
        return JsonResponse({"message": "User logged out"})

def cleanInput(val):
    cleaned = val.strip()
    cleaned = cleaned.capitalize()
    cleaned = re.sub(r'[^a-z0-9]+', ' ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned

# ----------------------------------------------------------------------------------------
# batchupdateExercise helper functions
def parseData(batchupdateData):
    batchupdateDataworkoutNames = list(batchupdateData.keys())
    dates = []
    exerciseNames = []
    exerciseData = []
    date_workoutName_pairs = []
    for i in batchupdateDataworkoutNames:
        for j in batchupdateData[i]:
            date = j["date"]
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
            dates.append(date_obj)
            date_workoutName_pairs.append((j["workoutName"],date_obj))
            exerciseNames.append(j["exerciseName"])
            exerciseData.append({
                "workoutName": cleanInput(j["workoutName"]),                    
                "exerciseReps":cleanInput(j["exerciseReps"]), 
                "exerciseSets":cleanInput(j["exerciseSets"]),
                "exerciseWeight":cleanInput(j["exerciseWeight"])
            })
    return batchupdateDataworkoutNames,dates,exerciseNames,date_workoutName_pairs,exerciseData
def workoutLogic(CurrentUser,batchupdateDataworkoutNames,date_workoutName_pairs,dates):
    workouts = Workout.objects.filter(name__in = batchupdateDataworkoutNames, date__in = dates)
    workouts = list(workouts)
    existingWorkoutPairsFound = {(w.name, w.date) for w in workouts}
    workoutsToMake = []
    for (w_name,w_date) in date_workoutName_pairs:
        key = (w_name, w_date)
        if(key not in existingWorkoutPairsFound):
            workoutsToMake.append(Workout(user=CurrentUser,name=w_name,date=w_date))
            existingWorkoutPairsFound.add(key)
    if workoutsToMake:
        Workout.objects.bulk_create(workoutsToMake,batch_size=500)
    workouts = Workout.objects.filter(name__in = batchupdateDataworkoutNames, date__in = dates)
    workout_lookup = {(w.name, w.date): w for w in workouts}
    return workouts, workout_lookup
def exerciseLogic(workouts,exerciseNames,workout_lookup,date_workoutName_pairs,exerciseData):
    exercises = Exercise.objects.filter(workout__in = workouts,exerciseName__in = exerciseNames)
    exercises = list(exercises)
    exercise_lookup = {(e.workout.name,e.workout.date,e.exerciseName):e for e in exercises}
    existingExercisePairsFound = set(exercise_lookup.keys())
    exercisesToMake = []
    for i in range(len(exerciseNames)):
        workout_obj = workout_lookup.get(date_workoutName_pairs[i])
        if workout_obj is None:
            print("⚠️ Workout not found for:", date_workoutName_pairs[i])
            continue
        key = (workout_obj.name,workout_obj.date,exerciseNames[i])
        if(key not in existingExercisePairsFound):
            exercisesToMake.append(
                Exercise(
                    workout=workout_obj,
                    exerciseName=exerciseNames[i],
                    exerciseReps=exerciseData[i]["exerciseReps"],
                    exerciseSets=exerciseData[i]["exerciseSets"],
                    exerciseWeight=exerciseData[i]["exerciseWeight"]
                ))
            existingExercisePairsFound.add(key)
        else:
            exercise_obj = exercise_lookup.get(key)
            for field in ["exerciseReps","exerciseSets","exerciseWeight"]:
                    value = exerciseData[i][field]
                    if value is not None:
                        setattr(exercise_obj, field, value)
    if exercisesToMake:
        Exercise.objects.bulk_create(exercisesToMake,batch_size=500)
    if exercise_lookup:
        Exercise.objects.bulk_update(
            exercise_lookup.values(),
            ["exerciseReps", "exerciseSets", "exerciseWeight"],
            batch_size=500
        )
# batchupdateExercise function
def batchupdateExercise(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error":"User not logged in yet"})
    if(request.method != "POST"):
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    else:
        try:
            data = json.loads(request.body)
            batchupdateData = data.get("batchUpdate",None)
            if(batchupdateData is not None):
                batchupdateDataworkoutNames,dates,exerciseNames,date_workoutName_pairs,exerciseData = parseData(batchupdateData)
                
                workouts, workout_lookup = workoutLogic(request.user,batchupdateDataworkoutNames,date_workoutName_pairs,dates)

                exerciseLogic(workouts,exerciseNames,workout_lookup,date_workoutName_pairs,exerciseData)
                return JsonResponse({"message":"Batch update complete"})
            else:
                return JsonResponse({"message":"Empty batchUpdate"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


def updateExercise(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error":"User not logged in yet"})
    if(request.method != "POST"):
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    else:
        try:
            data = json.loads(request.body)
            workoutName = data.get("workoutName")
            exerciseName = data.get("exerciseName", "")
            exerciseReps = data.get("exerciseReps",None)
            exerciseSets = data.get("exerciseSets",None)
            exerciseWeight = data.get("exerciseWeight",None)
            date = data.get("date")
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
            workout, _ = Workout.objects.get_or_create(user=request.user, name=workoutName,date=date_obj,)
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



def deleteExercise(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error":"User not logged in yet"})
    if(request.method != "POST"):
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    else:
        data = json.loads(request.body)
        workout = data.get("workout")
        exerciseName = data.get("exerciseName")
        exercise = Exercise.objects.get(workout=workout, exerciseName=exerciseName)
        exercise.delete()
        return JsonResponse({"message": "Exercise deleted"})


# ----------------------------------------------------------------------------------------


def addWorkout(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error":"User not logged in yet"})
    if(request.method != "POST"):
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    else:
        data = json.loads(request.body)
        newName = data.get("newName")
        workout = Workout(user=request.user, name=newName)
        workout.save()
        return JsonResponse({"message": "Workout created"})

def updateWorkout(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error":"User not logged in yet"})
    if(request.method != "POST"):
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    else:
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
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)



def deleteWorkout(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error":"User not logged in yet"})
    if(request.method != "POST"):
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    else:
        data = json.loads(request.body)
        workoutName = data.get("workoutName")
        workout = Workout(user=request.user,name=workoutName)
        workout.delete()
        return JsonResponse({"message": "Workout deleted"})



def getAllExercisesbasedOnDate(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error":"User not logged in yet"})
    if(request.method != "POST"):
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    else:
        try:
            data = json.loads(request.body)
            date = data.get("date")
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
            exercises = list(Exercise.objects.filter(workout__user=request.user,workout__date=date_obj))

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


def getAll(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error":"User not logged in yet"})
    else:
        try:
            everyExercise = list(Exercise.objects.filter(workout__user=request.user))
            toReturn = {}
            if everyExercise:
                for exercise in everyExercise:
                    dateTimeObjDate = exercise.workout.date
                    dateKeyString = dateTimeObjDate.isoformat()
                    workoutName = exercise.workout.name
                    if dateKeyString not in toReturn:
                        toReturn[dateKeyString] = {}
                    if workoutName not in toReturn[dateKeyString]:
                        toReturn[dateKeyString][workoutName] = []
                    toReturn[dateKeyString][workoutName].append({
                        "name" : exercise.exerciseName,
                        "reps" : exercise.exerciseReps,
                        "sets" : exercise.exerciseSets,
                        "weight" : exercise.exerciseWeight 
                    })
            return JsonResponse({"message":"success","data":toReturn})
        except Exception as e:
            return JsonResponse({"error":str(e)},status=400)


