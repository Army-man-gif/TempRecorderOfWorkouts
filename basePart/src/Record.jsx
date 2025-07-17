import "./record.css";
import {
  Users,
  addUser,
  getUser,
  setNewWorkoutPage,
  setNewExercise,
  deleteWorkoutPage,
  deleteExercise,
  numberOfWorkoutsOnThatDate,
  getMostRecentWorkoutPage,
  getWorkoutPage,
  numberOfExercisessInThatWorkout,
  getExercise,
} from "./databaseLogic.js";

import { useEffect, useState } from "react";
function Record() {
  const [user, setUser] = useState(() => prompt("Enter your username"));
  const [curDate, setCurDate] = useState("");
  const [workoutStarted, setworkoutStarted] = useState(false);
  const [selectDate, setSelectDate] = useState(false);
  const [displaying, setdiplsaying] = useState(false);
  useEffect(() => {
    async function load() {
      await Users();
      const lookFor = await getUser(user);
      if (!lookFor) {
        await addUser(user);
      }
    }
    alert(
      `This username is to be kept private. If you reveal this to others,
      they can access and alter your data. 
      If you need to see ur username again for remembering type 
      Yes in the following prompt`,
    );
    const confirm = prompt("Yes or No?");
    if (confirm == "Yes") {
      alert(user);
    }
    load(user);
  }, [user]);

  async function addExercise() {
    let exercise = document.getElementById("addEx").value;
    let reps = document.getElementById("addReps").value;
    let sets = document.getElementById("addSets").value;
    let weight = document.getElementById("addWeight").value;

    const repsParsed = parseInt(reps);
    const setsParsed = parseInt(sets);
    const weightParsed = parseFloat(weight);

    const workoutNumber = await getMostRecentWorkoutPage(user, curDate);
    if (workoutNumber || workoutNumber == 0) {
      const Newexercise = await setNewExercise(user, curDate, workoutNumber, {
        exercise: exercise,
        reps: repsParsed,
        sets: setsParsed,
        weight: weightParsed,
      });
      document.getElementById("addEx").value = "";
      document.getElementById("addReps").value = "";
      document.getElementById("addSets").value = "";
      document.getElementById("addWeight").value = "";
    }
  }
  async function createNewWorkout() {
    setworkoutStarted(true);
    const today = new Date().toISOString().split("T")[0];
    if (curDate != today) {
      const workout = await setNewWorkoutPage(user, today);
      setCurDate(today);
    }
  }
  function finished() {
    setworkoutStarted(false);
  }

  function displayExercises(workoutList) {
    for (const workout of workoutList) {
      for (const exercise of workout) {
        console.log(exercise.name);
      }
    }
  }
  async function viewWorkoutDate(e) {
    const dateFormatted = e.target.value;
    const numberOfWorkouts = await numberOfWorkoutsOnThatDate(
      user,
      dateFormatted,
    );
    if (numberOfWorkouts) {
      const workoutList = [];
      for (let i = 0; i < numberOfWorkouts; i++) {
        const exerciseList = [];
        const numberOfExercises = await numberOfExercisessInThatWorkout(
          user,
          dateFormatted,
          i,
        );
        for (let j = 0; j < numberOfExercises; j++) {
          const exercise = await getExercise(user, dateFormatted, i, j);
          if (exercise) {
            exerciseList.push(exercise);
          }
        }
        workoutList.push(exerciseList);
      }
      // call display stuff here
    }
  }
  function WorkoutButtonClicked() {
    setSelectDate(true);
  }
  function WorkoutViewClosed() {
    setSelectDate(false);
  }
  return (
    <>
      <button
        type="button"
        onClick={createNewWorkout}
        disabled={workoutStarted}
      >
        Click to add a new workout
      </button>

      <button type="button" onClick={WorkoutButtonClicked}>
        Click to view workouts on a specific date
      </button>
      {selectDate && (
        <>
          <form>
            <label htmlFor="workoutPick">Pick workout date: </label>
            <input
              type="date"
              id="workoutPick"
              name="workoutPick"
              onChange={(e) => viewWorkoutDate(e)}
            ></input>
          </form>
          <button type="button" onClick={WorkoutViewClosed}>
            Click to close view
          </button>
        </>
      )}
      {workoutStarted && (
        <>
          <div className="flex-container">
            <label htmlFor="addEx">Exercise: </label>
            <input id="addEx" type="text"></input>
            <label htmlFor="addReps">Reps: </label>
            <input id="addReps" type="text"></input>
            <label htmlFor="addSets">Sets: </label>
            <input id="addSets" type="text"></input>
            <label htmlFor="addWeight">Weight (in kg): </label>
            <input id="addWeight" type="text"></input>
            <br></br>
            <button type="button" onClick={addExercise}>
              Click to add exercise
            </button>
            <button type="button" onClick={finished}>
              Click to finish workout
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default Record;
