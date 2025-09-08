import "./record.css";
import {
  batchupdateExercise,
  User,
  justLogin,
  getAll,
} from "./talkingToBackendLogic.js";
import React, { useRef, useEffect, useState } from "react";
function Record() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [typingTimeout, setTypingTimeout] = useState(null);

  let Localdate = new Date().toISOString();
  let LocaldateunFormatted = convert(Localdate, timezone);
  const [curDate, setCurDate] = useState(null);
  const [curunformattedDate, setCurunformattedDate] = useState(null);
  const [workoutStarted, setworkoutStarted] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutNamesList, setWorkoutNamesList] = useState(null);
  const [workoutNameSet, setWorkoutNameSet] = useState(false);
  const [todayWorkoutList, setTodayWorkoutList] = useState({});
  const [SpecificworkoutList, setSpecificWorkoutList] = useState({});
  const [privateBrowsing, setPrivateBrowsing] = useState(false);
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
      let privateBrowsingLocalFlag = false;
      let dataToLookThrough = {};
      let name = "";
      let emptyName = false;
      let passkeyPulled = "";
      let emptyPasskey = false;

      if (isPrivateBrowsing()) {
        alert(
          ` You're in private browsing. If you close your tab without clicking
           'Finish Workout' your new exercises will not be saved. 
            Also everything will be slightly slower. 
            For more reliable saving and speed, switch off private browsing.
          `,
        );
        setPrivateBrowsing(true);
        privateBrowsingLocalFlag = true;
        localStorage.clear();
      }

      if (!privateBrowsingLocalFlag) {
        dataToLookThrough = JSON.parse(localStorage.getItem("data")) || {};
        if (Object.keys(dataToLookThrough).length > 0) {
          workoutNames();
          WorkoutListofToday();
        }
      }

      if (privateBrowsingLocalFlag) {
        name = JSON.parse(localStorage.getItem("username")) || "";
      }
      if (name == "") {
        emptyName = true;
      } else {
        emptyName = false;
      }
      if (privateBrowsingLocalFlag) {
        passkeyPulled = JSON.parse(localStorage.getItem("passkey")) || "";
      }
      if (passkeyPulled == "") {
        emptyPasskey = true;
      } else {
        emptyPasskey = false;
      }
      if (emptyPasskey || emptyName) {
        localStorage.clear();
        await User();
      } else {
        await justLogin(name, passkeyPulled);
      }

      if (Object.keys(dataToLookThrough).length === 0) {
        const info = await getAll();
        if (!privateBrowsingLocalFlag) {
          localStorage.setItem("data", JSON.stringify(info));
        } else {
          sessionStorage.setItem("data", JSON.stringify(info));
        }
        workoutNames();
        WorkoutListofToday();
      }

      setLoggedIn(true);
    }
    load();
  }, []);

  function isPrivateBrowsing() {
    try {
      localStorage.setItem("__test__", "1");
      localStorage.removeItem("__test__");
      return false;
    } catch {
      return true;
    }
  }
  /*

  */
  function convert(dateString, timezone) {
    const generalDate = new Date(dateString);
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
    setWorkoutName(wName);
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

      let dataPool = {};
      if (!privateBrowsing) {
        dataPool = JSON.parse(localStorage.getItem("data")) || {};
      } else {
        dataPool = JSON.parse(sessionStorage.getItem("data")) || {};
      }

      if (!(LocaldateunFormatted in dataPool)) {
        dataPool[LocaldateunFormatted] = {};
      }
      if (!(wName in dataPool[LocaldateunFormatted])) {
        dataPool[LocaldateunFormatted][wName] = [];
      }

      const changeExerciseIndexinDataPool = dataPool[LocaldateunFormatted][
        wName
      ].findIndex((exercise) => exercise.name === ex);
      if (changeExerciseIndexinDataPool >= 0) {
        dataPool[LocaldateunFormatted][wName][changeExerciseIndexinDataPool] =
          dateToChangeWorkoutStateListsWith;
      } else {
        dataPool[LocaldateunFormatted][wName].push(
          dateToChangeWorkoutStateListsWith,
        );
      }

      if (!privateBrowsing) {
        localStorage.setItem("data", JSON.stringify(dataPool));
      } else {
        sessionStorage.setItem("data", JSON.stringify(dataPool));
      }

      let stored = {};
      if (!privateBrowsing) {
        stored = JSON.parse(localStorage.getItem("workouts")) || {};
      } else {
        stored = JSON.parse(sessionStorage.getItem("workouts")) || {};
      }
      if (!(wName in stored)) {
        stored[wName] = [];
      }

      const changeExerciseIndex = stored[wName].findIndex(
        (exercise) => exercise.exerciseName === ex,
      );
      if (changeExerciseIndex >= 0) {
        stored[wName][changeExerciseIndex] = data;
      } else {
        stored[wName].push(data);
      }

      if (!privateBrowsing) {
        localStorage.setItem("workouts", JSON.stringify(stored));
        localStorage.setItem("timezone", JSON.stringify(timezone));
      } else {
        sessionStorage.setItem("workouts", JSON.stringify(stored));
        sessionStorage.setItem("timezone", JSON.stringify(timezone));
      }
      setAdding(false);
      pExercise.current = ex;
      pReps.current = r;
      pSets.current = s;
      pWeight.current = w;

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
      if (areBothDatesSame) {
        setSpecificWorkoutList((prev2) => {
          const existingList = prev2[wName] ?? [];

          const changeExerciseIndex = existingList.findIndex(
            (exercise) => exercise.name === ex,
          );

          let newList;
          newList = [...existingList];
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
    if (param == "ExerciseFororBack") {
      oneExerciseForwardorBack(data);
    }
    if (param === "changeWorkoutNameHasBeenSet") {
      if (workoutName && !workoutNamesList.includes(workoutName)) {
        const extended = [...workoutNamesList, workoutName];
        setWorkoutNamesList(extended);
        if (privateBrowsing) {
          sessionStorage.setItem("workoutNamesList", JSON.stringify(extended));
        } else {
          localStorage.setItem("workoutNamesList", JSON.stringify(extended));
        }
      }
      setWorkoutNameSet(true);
      setworkoutStarted(false);
      if (!privateBrowsing) {
        const batchupdateWorked =
          JSON.parse(localStorage.getItem("batchUpdateSuccess")) || false;
        if (!batchupdateWorked) {
          if (loggedIn) {
            await batchupdateExercise();
          } else {
            localStorage.setItem("batchUpdateSuccess", JSON.stringify(false));
          }
        }
      } else {
        if (loggedIn) {
          await batchupdateExercise();
        }
      }
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
      if (!privateBrowsing) {
        if (loggedIn) {
          await batchupdateExercise();
        } else {
          localStorage.setItem("batchUpdateSuccess", JSON.stringify(false));
        }
      } else {
        if (loggedIn) {
          await batchupdateExercise();
        }
      }
    }
    if (param === "view") {
      const date = data.target.value;
      if (date != curunformattedDate) {
        changeSpecificWorkoutList(date);
      }
    }
    if (param === "restore") {
      restore(data);
    }
  }
  function changeSpecificWorkoutList(date) {
    const chosenDate = new Date(date).toISOString();
    const chosenDateunFormatted = convert(chosenDate, timezone);
    let dataToLookThrough = {};
    if (!privateBrowsing) {
      dataToLookThrough = JSON.parse(localStorage.getItem("data"));
    } else {
      dataToLookThrough = JSON.parse(sessionStorage.getItem("data"));
    }
    const exercises = dataToLookThrough[chosenDateunFormatted] || {};
    setCurDate(date);
    setCurunformattedDate(chosenDateunFormatted);
    setSpecificWorkoutList(exercises);
  }
  function WorkoutListofToday() {
    Localdate = new Date().toISOString();
    LocaldateunFormatted = convert(Localdate, timezone);
    let dataToLookThrough = {};
    if (!privateBrowsing) {
      dataToLookThrough = JSON.parse(localStorage.getItem("data"));
    } else {
      dataToLookThrough = JSON.parse(sessionStorage.getItem("data"));
    }
    const exercises = dataToLookThrough[LocaldateunFormatted] || {};
    setTodayWorkoutList(exercises);
  }
  function workoutNames() {
    let names = [];
    if (!privateBrowsing) {
      names = JSON.parse(localStorage.getItem("workoutNamesList")) || [];
    } else {
      names = JSON.parse(sessionStorage.getItem("workoutNamesList")) || [];
    }
    if (names.length === 0) {
      let dataToLookThrough = {};
      if (!privateBrowsing) {
        dataToLookThrough = JSON.parse(localStorage.getItem("data")) || {};
      } else {
        dataToLookThrough = JSON.parse(sessionStorage.getItem("data")) || {};
      }
      const dates = Object.keys(dataToLookThrough);
      for (const date of dates) {
        const workouts = Object.keys(dataToLookThrough[date]);
        for (const workout of workouts) {
          if (!names.includes(workout.trim())) {
            names.push(workout.trim());
          }
        }
      }
    }
    setWorkoutNamesList(names);
    if (!privateBrowsing) {
      localStorage.setItem("workoutNamesList", JSON.stringify(names));
    } else {
      sessionStorage.setItem("workoutNamesList", JSON.stringify(names));
    }
  }
  function oneExerciseForwardorBack(change) {
    let dataToLookThrough = {};
    if (!privateBrowsing) {
      dataToLookThrough = JSON.parse(localStorage.getItem("data")) || {};
    } else {
      dataToLookThrough = JSON.parse(sessionStorage.getItem("data")) || {};
    }
    const dates = Object.keys(dataToLookThrough).reverse();
    outerLoop: for (const date of dates) {
      const workouts = Object.keys(dataToLookThrough[date]).reverse();
      for (const workout of workouts) {
        const exercisesList = dataToLookThrough[date][workout];
        for (let index = 0; index < exercisesList.length; index++) {
          if (workout === workoutName) {
            if (exercisesList[index]["name"] === exercise.current.value) {
              let netChange = index + change;
              if (netChange < 0) {
                netChange = index;
              }
              exercise.current.value = exercisesList[netChange]["name"];
              reps.current.value = exercisesList[netChange]["reps"];
              sets.current.value = exercisesList[netChange]["sets"];
              weight.current.value = exercisesList[netChange]["weight"];
              break outerLoop;
            }
          }
        }
      }
    }
  }
  function handleExerciseNameChange() {
    if (typingTimeout) clearTimeout(typingTimeout);

    // set a new timer
    const timeout = setTimeout(() => {
      addExercise();
    }, 1500);

    setTypingTimeout(timeout);
  }
  useEffect(() => {
    if (workoutNameSet) {
      let dataToLookThrough = {};
      if (!privateBrowsing) {
        dataToLookThrough = JSON.parse(localStorage.getItem("data")) || {};
      } else {
        dataToLookThrough = JSON.parse(sessionStorage.getItem("data")) || {};
      }
      const dates = Object.keys(dataToLookThrough).reverse();
      outerLoop: for (const date of dates) {
        const workouts = Object.keys(dataToLookThrough[date]).reverse();
        for (const workout of workouts) {
          const exercisesList = dataToLookThrough[date][workout];
          for (const exerciseCur of exercisesList) {
            if (workout === workoutName) {
              exercise.current.value = exerciseCur["name"];
              reps.current.value = exerciseCur["reps"];
              sets.current.value = exerciseCur["sets"];
              weight.current.value = exerciseCur["weight"];
              break outerLoop;
            }
          }
        }
      }
    }
  }, [workoutNameSet, workoutName, privateBrowsing]);
  return (
    <>
      <div className="flexContainer moreGap">
        <div className="flex-container">
          {Object.keys(todayWorkoutList).length > 0 && (
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
                  list="workoutNameOptions"
                  value={workoutName}
                  id="workoutName"
                  type="text"
                  placeholder="Choose or type..."
                  onChange={(e) => setWorkoutName(e.target.value)}
                ></input>
                <datalist id="workoutNameOptions">
                  <option value="">-- Select a workout --</option>
                  {workoutNamesList.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </datalist>
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
              <div className="adjustHeight">
                <label htmlFor="addEx">Exercise: </label>
                <div className="flexContainer">
                  <input
                    onChange={handleExerciseNameChange}
                    ref={exercise}
                    id="addEx"
                    type="text"
                    placeholder="Exercise name..."
                  ></input>
                </div>
                <br></br>
                <label htmlFor="addReps">Reps: </label>
                <div className="flexContainer">
                  <input
                    onChange={addExercise}
                    ref={reps}
                    id="addReps"
                    type="text"
                  ></input>
                </div>
                <br></br>

                <label htmlFor="addSets">Sets: </label>
                <div className="flexContainer">
                  <input
                    onChange={addExercise}
                    ref={sets}
                    id="addSets"
                    type="text"
                  ></input>
                </div>
                <br></br>

                <label htmlFor="addWeight">Weight (in kg): </label>
                <div className="flexContainer">
                  <input
                    onChange={addExercise}
                    ref={weight}
                    id="addWeight"
                    type="text"
                    disabled={adding && !loggedIn}
                  ></input>
                </div>
              </div>
              <br></br>

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
              <div className="flexContainer spaceNicely">
                <button onClick={() => main("ExerciseFororBack", -1)}>
                  ◄ Go back an exercise
                </button>
                <button onClick={() => main("ExerciseFororBack", 1)}>
                  Go to next exercise ►
                </button>
              </div>
            </>
          )}
        </div>
        <div className="flex-container rightSideSpecificWorkoutformat">
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
          {Object.keys(SpecificworkoutList).length > 0 && (
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
