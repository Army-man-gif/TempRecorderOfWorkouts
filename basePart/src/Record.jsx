import { useDrop } from "react-use";

import {
  Users,
  addUser,
  getUser,
  setNewWorkoutPage,
  setNewExercise,
  deleteWorkoutPage,
  deleteExercise,
  getMostRecentWorkoutPage,
} from "./databaseLogic.js";

import { useEffect, useState } from "react";
function Record() {
  const [user, setUser] = useState(() => prompt("Enter your username"));
  const [curDate, setCurDate] = useState("");
  const [workoutStarted, setworkoutStarted] = useState(false);

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
    const exercise = document.getElementById("addEx").value;
    const reps = document.getElementById("addReps").value;
    const sets = document.getElementById("addSets").value;
    const workoutNumber = await getMostRecentWorkoutPage(user, curDate);
    if (workoutNumber || workoutNumber == 0) {
      const Newexercise = await setNewExercise(user, curDate, workoutNumber, {
        exercise: exercise,
        reps: reps,
        sets: sets,
      });
    }
  }
  async function createNewWorkout() {
    setworkoutStarted(true);
    const today = new Date().toISOString().split("T")[0];
    if (curDate != today) {
      setCurDate(today);
      const workout = await setNewWorkoutPage(user, curDate);
    }
  }
  function finished() {
    setworkoutStarted(false);
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
      <form>
        <label htmlFor="workoutPick">Pick workout date: </label>
        <input type="date" id="workoutPick" name="workoutPick"></input>
        <button type="submit"></button>
      </form>

      {workoutStarted && (
        <>
          <label htmlFor="addEx">Exercise: </label>
          <input id="addEx" type="text"></input>
          <label htmlFor="addReps">Reps: </label>
          <input id="addReps" type="text"></input>
          <label htmlFor="addSets">Sets: </label>
          <input id="addSets" type="text"></input>
          <button type="button" onClick={addExercise}>
            Click to add exercise
          </button>
          <button type="button" onClick={finished}>
            Click to finish workout
          </button>
        </>
      )}
    </>
  );
}

export default Record;
