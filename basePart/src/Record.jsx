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
  getExerciseData,
} from "./databaseLogic.js";

import React, { useRef, useEffect, useState } from "react";
function Record() {
  const [user, setUser] = useState(() => prompt("Enter your username"));
  const [curDate, setCurDate] = useState("");
  const [workoutStarted, setworkoutStarted] = useState(false);
  const [workoutList, setWorkoutList] = useState([]);
  const exercise = useRef(null);
  const reps = useRef(null);
  const sets = useRef(null);
  const weight = useRef(null);
  let pExercise = "";
  let pReps = "";
  let pSets = "";
  let pWeight = "0";
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

  function restore() {
    exercise.current.value = pExercise;
    reps.current.value = pReps;
    sets.current.value = pSets;
    weight.current.value = pWeight;
  }
  async function addExercise() {
    if (exercise != "" && reps != "" && sets != "" && weight != "") {
      const workoutNumber = await getMostRecentWorkoutPage(user, curDate);
      if (workoutNumber || workoutNumber == 0) {
        const today = new Date().toISOString().split("T")[0];
        const Newexercise = await setNewExercise(user, today, workoutNumber, {
          exercise: exercise.current.value,
          reps: reps.current.value,
          sets: sets.current.value,
          weight: weight.current.value,
        });
        if (Newexercise) {
          pExercise = exercise.current.value;
          pReps = reps.current.value;
          pSets = sets.current.value;
          pWeight = weight.current.value;
          exercise.current.value = "";
          reps.current.value = "";
          sets.current.value = "";
          weight.current.value = "";
          setCurDate(today);
          changeWorkoutList(today);
        }
      }
    }
  }
  async function createNewWorkout() {
    started();
    const today = new Date().toISOString().split("T")[0];
    const workout = await setNewWorkoutPage(user, today);
    if (workout) {
      setCurDate(today);
      changeWorkoutList(today);
    } else {
      console.log("error setting workout page");
    }
  }
  function started() {
    setworkoutStarted(true);
  }
  function finished() {
    setworkoutStarted(false);
  }

  async function changeWorkoutList(dateFormatted) {
    const numberOfWorkouts = await numberOfWorkoutsOnThatDate(
      user,
      dateFormatted,
    );
    console.log(numberOfWorkouts);
    if (numberOfWorkouts > 0) {
      const WorkoutList = [];
      for (let i = 0; i < numberOfWorkouts; i++) {
        const exerciseList = [];
        const numberOfExercises = await numberOfExercisessInThatWorkout(
          user,
          dateFormatted,
          i,
        );
        console.log(numberOfExercises);
        if (numberOfExercises > 0) {
          for (let j = 0; j < numberOfExercises; j++) {
            const exercise = await getExerciseData(user, dateFormatted, i, j);
            if (exercise) {
              console.log("exercise data: " + exercise.reps);
              exerciseList.push({
                name: exercise.exercise,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
              });
            }
          }
          WorkoutList.push(exerciseList);
        }
      }
      setCurDate(dateFormatted);
      setWorkoutList(WorkoutList);
    } else {
      setWorkoutList([]);
    }
  }
  async function viewWorkoutDate(e) {
    const dateFormatted = e.target.value;
    await changeWorkoutList(dateFormatted);
  }

  return (
    <>
      <form>
        <label htmlFor="workoutPick">
          Pick workout date to view workouts of:{" "}
        </label>
        <input
          type="date"
          id="workoutPick"
          name="workoutPick"
          onChange={(e) => viewWorkoutDate(e)}
        ></input>
      </form>
      {workoutList.length > 0 && (
        <table>
          <thead>
            <tr>
              <th id="dateHeading" colSpan="5">
                Date: {curDate}
              </th>
            </tr>
            <tr>
              <th>Exercise number</th>
              <th>Exercise Name</th>
              <th>Reps</th>
              <th>Sets</th>
              <th>Weight (in kg)</th>
            </tr>
          </thead>
          <tbody>
            {workoutList.map((workout, workoutIndex) => (
              <React.Fragment key={workoutIndex}>
                <tr>
                  <td></td>
                  <td id="workout_block_line" colSpan="4">
                    Workout {workoutIndex + 1}
                  </td>
                </tr>
                {workout.map((exercise, exerciseIndex) => (
                  <tr key={exerciseIndex}>
                    <td>Exercise {exerciseIndex + 1}</td>
                    <td>{exercise.name}</td>
                    <td>{exercise.reps}</td>
                    <td>{exercise.sets}</td>
                    <td>{exercise.weight}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
      <button
        type="button"
        onClick={createNewWorkout}
        disabled={workoutStarted}
      >
        Click to add a new workout
      </button>
      {workoutStarted && (
        <>
          <br></br>
          <br></br>
          <label htmlFor="addEx">Exercise: </label>
          <div className="flexContainer">
            <input ref={exercise} id="addEx" type="text"></input>
            <button onClick={restore} type="button">
              Click to restore previous value
            </button>
          </div>
          <br></br>
          <label htmlFor="addReps">Reps: </label>
          <div className="flexContainer">
            <input ref={reps} id="addReps" type="text"></input>
            <button onClick={restore} type="button">
              Click to restore previous value
            </button>
          </div>
          <br></br>

          <label htmlFor="addSets">Sets: </label>
          <div className="flexContainer">
            <input ref={sets} id="addSets" type="text"></input>
            <button onClick={restore} type="button">
              Click to restore previous value
            </button>
          </div>
          <br></br>

          <label htmlFor="addWeight">Weight (in kg): </label>
          <div className="flexContainer">
            <input ref={weight} id="addWeight" type="text"></input>
            <button onClick={restore} type="button">
              Click to restore previous value
            </button>
          </div>

          <br></br>

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
