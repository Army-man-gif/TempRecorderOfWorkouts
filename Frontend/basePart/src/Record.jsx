import "./record.css";
import {
  User,
  updateExercise,
  logout,
  getExercisesofThatDate,
} from "./talkingToBackendLogic.js";

import React, { useRef, useEffect, useState } from "react";
function Record() {
  const [user, setUser] = useState(() => prompt("Enter your username"));
  const [passkey, setPasskey] = useState(() => prompt("Enter your passkey"));
  const [curDate, setCurDate] = useState(() =>
    new Date().toLocaleDateString("en-CA"),
  );
  const [workoutStarted, setworkoutStarted] = useState(false);
  const [previousworkoutName, setPreviousworkoutName] = useState("");
  const [workoutName, setWorkoutName] = useState("");
  const [workoutNameSet, setWorkoutNameSet] = useState(false);
  const [todayWorkoutList, setTodayWorkoutList] = useState({});
  const [SpecificworkoutList, setSpecificWorkoutList] = useState({});
  const exercise = useRef(null);
  const reps = useRef(null);
  const sets = useRef(null);
  const weight = useRef(null);
  let pExercise = useRef(null);
  let pReps = useRef(null);
  let pSets = useRef(null);
  let pWeight = useRef(null);
  useEffect(() => {
    async function load() {
      await User(user, passkey);
      await WorkoutListofToday();
    }
    load(user);
  }, [user]);

  function restore(field) {
    if (field == "exercise") {
      exercise.current.value = pExercise.current;
    }
    if (field == "sets") {
      sets.current.value = pSets.current;
    }
    if (field == "reps") {
      reps.current.value = pReps.current;
    }
    if (field == "weight") {
      weight.current.value = pWeight.current;
    }
    if (field == "workoutName") {
      setWorkoutName(previousworkoutName);
    }
  }
  async function addExercise() {
    const wName = workoutName;
    const ex = exercise.current?.value.trim();
    const r = reps.current?.value.trim();
    const s = sets.current?.value.trim();
    const w = weight.current?.value.trim();
    if (ex && r && s && w && wName) {
      const data = {
        workoutName: wName,
        exerciseName: ex,
        exerciseReps: r,
        exerciseSets: s,
        exerciseWeight: w,
      };
      await updateExercise(data);
      setPreviousworkoutName(wName);
      pExercise.current = ex;
      pReps.current = r;
      pSets.current = s;
      pWeight.current = w;
      exercise.current.value = "";
      reps.current.value = "";
      sets.current.value = "";
      weight.current.value = "";
      await WorkoutListofToday();
    }
  }

  function changeWorkoutNameHasBeenSet() {
    setWorkoutNameSet(true);
    setworkoutStarted(false);
  }
  function started() {
    setworkoutStarted(true);
  }
  async function finished() {
    setWorkoutNameSet(false);
    setWorkoutName("");
    await WorkoutListofToday();
  }
  async function changeSpecificWorkoutList(date) {
    const exercises = await getExercisesofThatDate(date);
    setCurDate(date);
    setSpecificWorkoutList(exercises);
  }
  async function WorkoutListofToday() {
    const date = new Date().toLocaleDateString("en-CA");
    const exercises = await getExercisesofThatDate(date);
    setTodayWorkoutList(exercises);
  }
  async function viewWorkoutDate(e) {
    const date = e.target.value;
    await changeSpecificWorkoutList(date);
  }

  return (
    <>
      <form className="move">
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
      {Object.keys(SpecificworkoutList).length > 0 && (
        <table className="move2">
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
            {Object.entries(SpecificworkoutList).map(
              ([workoutName, workoutData], counter) => (
                <React.Fragment key={`${workoutName}-${counter}`}>
                  <tr>
                    <td></td>
                    <td id="workout_block_line" colSpan="4">
                      {workoutName}
                    </td>
                  </tr>
                  {workoutData.map((exercise, exerciseIndex) => (
                    <tr
                      key={`Workout-${workoutName}-${counter}-Exercise-${exerciseIndex}-${counter}`}
                    >
                      <td>Exercise {exerciseIndex + 1}</td>
                      <td>{exercise["name"]}</td>
                      <td>{exercise["reps"]}</td>
                      <td>{exercise["sets"]}</td>
                      <td>{exercise["weight"]}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ),
            )}
          </tbody>
        </table>
      )}
      {Object.keys(todayWorkoutList).length > 0 && (
        <table className="center">
          <thead>
            <tr>
              <th id="dateHeading" colSpan="5">
                Date: {new Date().toLocaleDateString("en-CA")}
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
            {Object.entries(todayWorkoutList).map(
              ([workoutName, workoutData], counter) => (
                <React.Fragment key={`${workoutName}-${counter}`}>
                  <tr>
                    <td></td>
                    <td id="workout_block_line" colSpan="4">
                      {workoutName}
                    </td>
                  </tr>
                  {workoutData.map((exercise, exerciseIndex) => (
                    <tr
                      key={`Workout-${workoutName}-${counter}-Exercise-${exerciseIndex}-${counter}`}
                    >
                      <td>Exercise {exerciseIndex + 1}</td>
                      <td>{exercise["name"]}</td>
                      <td>{exercise["reps"]}</td>
                      <td>{exercise["sets"]}</td>
                      <td>{exercise["weight"]}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ),
            )}
          </tbody>
        </table>
      )}
      <button type="button" onClick={started} disabled={workoutStarted}>
        Click to add a new workout
      </button>
      {workoutStarted && (
        <>
          <br></br>
          <br></br>
          <label htmlFor="workoutName">Workout name: </label>
          <div className="flexContainer">
            <input
              value={workoutName}
              id="workoutName"
              type="text"
              onChange={(e) => setWorkoutName(e.target.value)}
            ></input>
            <button onClick={() => restore("workoutName")} type="button">
              Click to restore previous value
            </button>
          </div>
          <button type="button" onClick={changeWorkoutNameHasBeenSet}>
            Confirm name
          </button>
        </>
      )}
      {workoutNameSet && (
        <>
          <br></br>
          <br></br>
          <label htmlFor="addEx">Exercise: </label>
          <div className="flexContainer">
            <input ref={exercise} id="addEx" type="text"></input>
            <button onClick={() => restore("exercise")} type="button">
              Click to restore previous value
            </button>
          </div>
          <br></br>
          <label htmlFor="addReps">Reps: </label>
          <div className="flexContainer">
            <input ref={reps} id="addReps" type="text"></input>
            <button onClick={() => restore("reps")} type="button">
              Click to restore previous value
            </button>
          </div>
          <br></br>

          <label htmlFor="addSets">Sets: </label>
          <div className="flexContainer">
            <input ref={sets} id="addSets" type="text"></input>
            <button onClick={() => restore("sets")} type="button">
              Click to restore previous value
            </button>
          </div>
          <br></br>

          <label htmlFor="addWeight">Weight (in kg): </label>
          <div className="flexContainer">
            <input ref={weight} id="addWeight" type="text"></input>
            <button onClick={() => restore("weight")} type="button">
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
