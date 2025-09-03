import "./record.css";
import {
  User,
  updateExercise,
  batchupdateExercise,
  logout,
  justLogin,
  getExercisesofThatDate,
} from "./talkingToBackendLogic.js";

import React, { useRef, useEffect, useState } from "react";
function Record() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  function convert(dateString, timezone) {
    // Parse the input date (assumes it's an ISO string, e.g. "2025-09-04T12:00:00Z")
    const generalDate = new Date(dateString);

    // Format the date into the given timezone
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(generalDate);
    const year = parts.find((p) => p.type === "year").value;
    const month = parts.find((p) => p.type === "month").value;
    const day = parts.find((p) => p.type === "day").value;
    return `${year}-${month}-${day}`;
  }

  let Localdate = new Date().toISOString();
  let LocaldateunFormatted = convert(Localdate, timezone);
  const [curDate, setCurDate] = useState(null);
  const [curunformattedDate, setCurunformattedDate] = useState(null);
  const [workoutStarted, setworkoutStarted] = useState(false);
  const [previousworkoutName, setPreviousworkoutName] = useState("");
  const [workoutName, setWorkoutName] = useState("");
  const [workoutNameSet, setWorkoutNameSet] = useState(false);
  const [todayWorkoutList, setTodayWorkoutList] = useState({});
  const [SpecificworkoutList, setSpecificWorkoutList] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [adding, setAdding] = useState(false);
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
      const name = JSON.parse(localStorage.getItem("username")) ?? "";
      let emptyName = false;
      if (name == "") {
        emptyName = true;
      } else {
        emptyName = false;
      }
      const passkeyPulled = JSON.parse(localStorage.getItem("passkey")) ?? "";
      let emptyPasskey = false;
      if (passkeyPulled == "") {
        emptyPasskey = true;
      } else {
        emptyPasskey = false;
      }
      console.log(name, passkeyPulled);
      if (emptyPasskey || emptyName) {
        await User();
      } else {
        await justLogin(name, passkeyPulled);
      }
      setLoggedIn(true);
      await WorkoutListofToday();
    }
    load();
  }, []);

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
    setAdding(true);
    Localdate = new Date().toISOString();
    LocaldateunFormatted = convert(Localdate, timezone);
    let areBothDatesSame = false;
    if (curunformattedDate == LocaldateunFormatted) {
      areBothDatesSame = true;
    }
    const wName = workoutName;
    const ex = exercise.current?.value.trim();
    const r = reps.current?.value.trim();
    const s = sets.current?.value.trim();
    const w = weight.current?.value.trim();
    if (ex && r && s && w && wName) {
      const data = {
        date: LocaldateunFormatted,
        workoutName: wName,
        exerciseName: ex,
        exerciseReps: r,
        exerciseSets: s,
        exerciseWeight: w,
      };
      const dateToChangeWorkoutStateListsWith = {
        name: ex,
        reps: r,
        sets: s,
        weight: w,
      };
      const stored = JSON.parse(localStorage.getItem("workouts")) || {};
      if (!(wName in stored)) {
        stored[wName] = [];
        stored[wName].push(data);
      } else {
        const changeExerciseIndex = stored[wName].findIndex(
          (exercise) => exercise.exerciseName === ex,
        );
        if (changeExerciseIndex >= 0) {
          stored[wName][changeExerciseIndex] = data;
        } else {
          stored[wName].push(data);
        }
      }
      console.log(stored);
      localStorage.setItem("workouts", JSON.stringify(stored));
      localStorage.setItem("timezone", JSON.stringify(timezone));
      setPreviousworkoutName(wName);
      setAdding(false);
      pExercise.current = ex;
      pReps.current = r;
      pSets.current = s;
      pWeight.current = w;
      exercise.current.value = "";
      reps.current.value = "";
      sets.current.value = "";
      weight.current.value = "";
      setTodayWorkoutList((prev) => {
        const existingList = prev[wName] ?? [];

        const changeExerciseIndex = existingList.findIndex(
          (exercise) => exercise.name === ex,
        );

        let newList;

        if (changeExerciseIndex >= 0) {
          // Replace existing exercise
          newList = [...existingList];
          newList[changeExerciseIndex] = dateToChangeWorkoutStateListsWith;
        } else {
          // Add new exercise
          newList = [...existingList, dateToChangeWorkoutStateListsWith];
        }

        return {
          ...prev,
          [wName]: newList,
        };
      });
      console.log(areBothDatesSame);
      if (areBothDatesSame) {
        setSpecificWorkoutList((prev2) => {
          const existingList = prev2[wName] ?? [];

          const changeExerciseIndex = existingList.findIndex(
            (exercise) => exercise.name === ex,
          );

          let newList;
          newList = [...existingList];
          newList = Array.from(
            new Map(newList.map((ex) => [ex.name, ex])).values(),
          );
          if (changeExerciseIndex >= 0) {
            // Replace existing exercise
            newList[changeExerciseIndex] = dateToChangeWorkoutStateListsWith;
          } else {
            // Add new exercise
            newList = [...existingList, dateToChangeWorkoutStateListsWith];
          }

          return {
            ...prev2,
            [wName]: newList,
          };
        });
      }
    }
  }
  async function main(param, data = null) {
    if (param === "changeWorkoutNameHasBeenSet") {
      setWorkoutNameSet(true);
      setworkoutStarted(false);
    }
    if (param === "cancelWorkout") {
      setWorkoutNameSet(false);
      setworkoutStarted(false);
    }
    if (param === "cancelExercise") {
      setWorkoutNameSet(false);
      setworkoutStarted(true);
      restore("workoutName");
    }
    if (param === "started") {
      setworkoutStarted(true);
    }
    if (param === "finished") {
      setWorkoutNameSet(false);
      setWorkoutName("");
      await batchupdateExercise();
    }
    if (param === "view") {
      const date = data.target.value;
      if (date != curunformattedDate) {
        await changeSpecificWorkoutList(date);
      }
    }
    if (param === "restore") {
      restore(data);
    }
  }
  async function changeSpecificWorkoutList(date) {
    const chosenDate = new Date(date).toISOString();
    const chosenDateunFormatted = convert(chosenDate, timezone);
    const exercises = await getExercisesofThatDate(chosenDateunFormatted);
    setCurDate(date);
    setCurunformattedDate(chosenDateunFormatted);
    setSpecificWorkoutList(exercises);
  }
  async function WorkoutListofToday() {
    Localdate = new Date().toISOString();
    LocaldateunFormatted = convert(Localdate, timezone);
    const exercises = await getExercisesofThatDate(LocaldateunFormatted);
    setTodayWorkoutList(exercises);
  }

  return (
    <>
      <div className="flexContainer moreGap">
        <div className="flex-container">
          {loggedIn && Object.keys(todayWorkoutList).length > 0 && (
            <table className="adjustTodayDataDisplay">
              <thead>
                <tr>
                  <th id="dateHeading" colSpan="5">
                    Date: {LocaldateunFormatted}
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
          <button
            className="SquishSize"
            type="button"
            onClick={() => main("started")}
            disabled={workoutStarted}
          >
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
                <button
                  onClick={() => main("restore", "workoutName")}
                  type="button"
                >
                  Click to restore previous value
                </button>
              </div>
              <div className="flexContainer lessGap">
                <button
                  type="button"
                  onClick={() => main("changeWorkoutNameHasBeenSet")}
                >
                  Confirm name
                </button>
                <button type="button" onClick={() => main("cancelWorkout")}>
                  Cancel workout
                </button>
              </div>
            </>
          )}
          {workoutNameSet && (
            <>
              <br></br>
              <br></br>
              <label htmlFor="addEx">Exercise: </label>
              <div className="adjustHeight">
                <div className="flexContainer">
                  <input ref={exercise} id="addEx" type="text"></input>
                  <button
                    onClick={() => main("restore", "exercise")}
                    type="button"
                  >
                    Restore
                  </button>
                </div>
                <br></br>
                <label htmlFor="addReps">Reps: </label>
                <div className="flexContainer">
                  <input ref={reps} id="addReps" type="text"></input>
                  <button onClick={() => main("restore", "reps")} type="button">
                    Restore
                  </button>
                </div>
                <br></br>

                <label htmlFor="addSets">Sets: </label>
                <div className="flexContainer">
                  <input ref={sets} id="addSets" type="text"></input>
                  <button onClick={() => main("restore", "sets")} type="button">
                    Restore
                  </button>
                </div>
                <br></br>

                <label htmlFor="addWeight">Weight (in kg): </label>
                <div className="flexContainer">
                  <input
                    ref={weight}
                    id="addWeight"
                    type="text"
                    disabled={adding && !loggedIn}
                  ></input>
                  <button
                    onClick={() => main("restore", "weight")}
                    type="button"
                  >
                    Restore
                  </button>
                </div>
              </div>
              <br></br>

              <button
                className="SquishSize"
                type="button"
                onClick={addExercise}
                disabled={adding && !loggedIn}
              >
                Click to add exercise
              </button>
              <button
                className="SquishSize"
                type="button"
                onClick={() => main("finished")}
                disabled={adding && !loggedIn}
              >
                Click to finish workout
              </button>
              <button
                className="SquishSize"
                type="button"
                onClick={() => main("cancelExercise")}
              >
                Click to cancel exercise
              </button>
            </>
          )}
        </div>
        <div className="flex-container rightSideSpecificWorkoutformat">
          {loggedIn && (
            <form>
              <label htmlFor="workoutPick">
                Pick workout date to view workouts of:{" "}
              </label>
              <input
                type="date"
                id="workoutPick"
                name="workoutPick"
                onChange={(e) => main("view", e)}
              ></input>
            </form>
          )}
          {loggedIn && Object.keys(SpecificworkoutList).length > 0 && (
            <table>
              <thead>
                <tr>
                  <th id="dateHeading" colSpan="5">
                    Date: {curunformattedDate}
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
        </div>
      </div>
    </>
  );
}

export default Record;
