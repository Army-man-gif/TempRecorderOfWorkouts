from django.urls import path,include
from . import views
urlpatterns = [
    path("setToken/",views.setToken,name="setToken"),
    path("getToken/",views.get_csrf_token,name="getToken"),
    
    path("GetorMakeUser/", views.GetorMakeUser,name="GetorMakeUser"),
    path("validateUser/", views.validateUser,name="validateUser"),
    path("deleteUser/", views.deleteUser,name="deleteUser"),
    
    path("login/", views.loginView,name="login"),
    path("logout/", views.logoutView,name="logout"),
    
    path("updateExercise/", views.updateExercise,name="updateExercise"),
    path("deleteExercise/", views.deleteExercise,name="deleteExercise"),
    
    
    path("addWorkout/", views.addWorkout,name="addWorkout"),
    path("updateWorkout/", views.updateWorkout,name="updateWorkout"),
    path("deleteWorkout/",views.deleteWorkout,name="deleteWorkout"),
    
    path("getAllExercisesbasedOnDate/", views.getAllExercisesbasedOnDate,name="getAllExercisesbasedOnDate"),

]