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
  let LocaldateunFormatted = formatDate(Localdate, timezone);
  const [curDate, setCurDate] = useState(null);
  const [curunformattedDate, setCurunformattedDate] = useState(null);
  const [workoutStarted, setworkoutStarted] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutNamesList, setWorkoutNamesList] = useState([]);
  const [workoutNameSet, setWorkoutNameSet] = useState(false);
  const [todayWorkoutList, setTodayWorkoutList] = useState({});
  const [SpecificworkoutList, setSpecificWorkoutList] = useState({});
  const [privateBrowsing, setPrivateBrowsing] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [adding, setAdding] = useState(false);
  const [backExerciseText, setBackExerciseText] = useState(
    "◄ Go back an exercise",
  );
  const [forwardExerciseText, setForwardExerciseText] = useState(
    "Go to next exercise ►",
  );
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

      if (checkPrivateBrowsing()) {
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
          loadWorkoutNames();
          loadTodayList();
        }
      }

      if (!privateBrowsingLocalFlag) {
        name = JSON.parse(localStorage.getItem("username")) || "";
      }
      if (name == "") {
        emptyName = true;
      } else {
        emptyName = false;
      }
      if (!privateBrowsingLocalFlag) {
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
        const info = (await getAll()) || {};
        if (!privateBrowsingLocalFlag) {
          localStorage.setItem("data", JSON.stringify(info));
        } else {
          sessionStorage.setItem("data", JSON.stringify(info));
        }
        loadWorkoutNames();
        loadTodayList();
      }

      setLoggedIn(true);
    }
    load();
  }, []);

  function checkPrivateBrowsing() {
    try {
      localStorage.setItem("__test__", "1");
      localStorage.removeItem("__test__");
      return false;
    } catch {
      return true;
    }
  }
  function formatDate(dateString, timezone) {
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
  // Add exercise helper functions
  function normalizeInput(input) {
    const cleaned = input
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace(/[^a-z0-9]+/gi, " ")
      .replace(/\s+/g, " ");
    return cleaned;
  }
  function saveIterData(wName, dateToChangeWorkoutStateListsWith, ex) {
    const purelyForDisplay =
      JSON.parse(
        sessionStorage.getItem("dataToIterateThroughBasedonWorkoutName"),
      ) || {};
    const dates = Object.keys(purelyForDisplay);
    let date = "";
    for (const curDate of dates) {
      if (wName in purelyForDisplay[curDate]) {
        date = curDate;
      }
    }
    if (date === "") {
      date = LocaldateunFormatted;
    }
    if (!(date in purelyForDisplay)) {
      purelyForDisplay[date] = {};
    }
    if (!(wName in purelyForDisplay[date])) {
      purelyForDisplay[date][wName] = [];
    }
    const changeExerciseIndexinpurelyForDisplay = purelyForDisplay[date][
      wName
    ].findIndex((exercise) => exercise.name === ex);
    if (changeExerciseIndexinpurelyForDisplay >= 0) {
      purelyForDisplay[date][wName][changeExerciseIndexinpurelyForDisplay] =
        dateToChangeWorkoutStateListsWith;
    } else {
      purelyForDisplay[date][wName].push(dateToChangeWorkoutStateListsWith);
    }
    sessionStorage.setItem(
      "dataToIterateThroughBasedonWorkoutName",
      JSON.stringify(purelyForDisplay),
    );
  }
  function saveDataStore(wName, dateToChangeWorkoutStateListsWith, ex) {
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
  }
  function saveWorkoutData(wName, data, ex) {
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
  }
  function saveTodayList(wName, dateToChangeWorkoutStateListsWith, ex) {
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
  }
  function saveSpecificList(wName, dateToChangeWorkoutStateListsWith, ex) {
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
  function setupExercise() {
    setAdding(true);
    let areBothDatesSame = false;
    if (curunformattedDate == LocaldateunFormatted) {
      areBothDatesSame = true;
    }
    const wName = workoutName;
    setWorkoutName(wName);
    const ex = normalizeInput(exercise.current?.value);
    const r = normalizeInput(reps.current?.value);
    const s = normalizeInput(sets.current?.value);
    const w = normalizeInput(weight.current?.value);
    return { areBothDatesSame, wName, ex, r, s, w };
  }
  function buildExerciseData(wName, ex, r, s, w) {
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
    return { data, dateToChangeWorkoutStateListsWith };
  }
  function finaliseExercise(ex, r, s, w) {
    setAdding(false);
    pExercise.current = ex;
    pReps.current = r;
    pSets.current = s;
    pWeight.current = w;
  }
  // Add exercise function
  async function addExercise() {
    const { areBothDatesSame, wName, ex, r, s, w } = setupExercise();
    if (ex && r && s && w && wName) {
      const { data, dateToChangeWorkoutStateListsWith } = buildExerciseData(
        wName,
        ex,
        r,
        s,
        w,
      );
      //saveIterData(wName, dateToChangeWorkoutStateListsWith, ex);
      saveDataStore(wName, dateToChangeWorkoutStateListsWith, ex);
      saveWorkoutData(wName, data, ex);

      finaliseExercise(ex, r, s, w);

      saveTodayList(wName, dateToChangeWorkoutStateListsWith, ex);
      if (areBothDatesSame) {
        saveSpecificList(wName, dateToChangeWorkoutStateListsWith, ex);
      }
    }
  }
  async function handleAction(param, data = null) {
    if (param == "ExerciseFororBack") {
      navigateExercise(data);
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
        loadSpecificList(date);
      }
    }
  }
  function loadSpecificList(date) {
    const chosenDate = new Date(date).toISOString();
    const chosenDateunFormatted = formatDate(chosenDate, timezone);
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
  function loadTodayList() {
    Localdate = new Date().toISOString();
    LocaldateunFormatted = formatDate(Localdate, timezone);
    let dataToLookThrough = {};
    if (!privateBrowsing) {
      dataToLookThrough = JSON.parse(localStorage.getItem("data"));
    } else {
      dataToLookThrough = JSON.parse(sessionStorage.getItem("data"));
    }
    const exercises = dataToLookThrough[LocaldateunFormatted] || {};
    setTodayWorkoutList(exercises);
  }
  function loadWorkoutNames() {
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
  function cacheIterData() {
    let dataToSave = {};
    let dataToLookThrough = {};
    if (!privateBrowsing) {
      dataToLookThrough = JSON.parse(localStorage.getItem("data")) || {};
    } else {
      dataToLookThrough = JSON.parse(sessionStorage.getItem("data")) || {};
    }
    const dates = Object.keys(dataToLookThrough).reverse();
    for (const date of dates) {
      const workouts = Object.keys(dataToLookThrough[date]).reverse();
      for (const workout of workouts) {
        if (!dataToSave[date]) {
          dataToSave[date] = {};
        }
        const exercisesList = dataToLookThrough[date][workout] || [];
        dataToSave[date][workout] = exercisesList;
      }
    }
    sessionStorage.setItem(
      "dataToIterateThroughBasedonWorkoutName",
      JSON.stringify(dataToSave),
    );
  }
  function CustomDisplayListBasedonWorkout() {
    let toReturn = [];
    let dataToLookThrough = {};
    if (!privateBrowsing) {
      dataToLookThrough = JSON.parse(localStorage.getItem("data")) || {};
    } else {
      dataToLookThrough = JSON.parse(sessionStorage.getItem("data")) || {};
    }

    const dates = Object.keys(dataToLookThrough).reverse();
    for (const date of dates) {
      const workouts = Object.keys(dataToLookThrough[date]);
      if (workouts.includes(workoutName)) {
        const list = dataToLookThrough[date][workoutName];
        for (const exercise of list) {
          toReturn.push(exercise);
        }
      }
    }
    return toReturn;
  }
  function navigateExercise(change) {
    const exerciseList = CustomDisplayListBasedonWorkout();
    if (exerciseList.length > 0) {
      for (let count = 0; count < exerciseList.length; count++) {
        let netChange = count + change;
        if (netChange >= exerciseList.length || netChange < 0) {
          netChange = 0;
          if (netChange < 0) {
            setBackExerciseText("Click to go to last exercise");
          }
          if (netChange >= exerciseList.length) {
            setForwardExerciseText("Click to go to first exercise");
          }
        }
        setBackExerciseText("◄ Go back an exercise");
        setForwardExerciseText("Go to next exercise ►");

        if (exerciseList[count]["name"] === exercise.current.value) {
          exercise.current.value = exerciseList[netChange]["name"] || "";
          reps.current.value = exerciseList[netChange]["reps"] || "";
          sets.current.value = exerciseList[netChange]["sets"] || "";
          reps.current.value = exerciseList[netChange]["reps"] || "";
          weight.current.value = exerciseList[netChange]["weight"] || "";
          break;
        }
      }
    }
  }
  function debouncedExerciseChange() {
    if (typingTimeout) clearTimeout(typingTimeout);

    // set a new timer
    const timeout = setTimeout(() => {
      addExercise();
    }, 1500);

    setTypingTimeout(timeout);
  }
  useEffect(() => {
    if (workoutNameSet) {
      const exerciseList = CustomDisplayListBasedonWorkout();
      if (exerciseList.length > 0) {
        exercise.current.value = exerciseList[0]["name"] || "";
        reps.current.value = exerciseList[0]["reps"] || "";
        sets.current.value = exerciseList[0]["sets"] || "";
        reps.current.value = exerciseList[0]["reps"] || "";
        weight.current.value = exerciseList[0]["weight"] || "";
      }
    }
  }, [workoutNameSet]);
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
            onClick={() => handleAction("started")}
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
                  onClick={() => handleAction("changeWorkoutNameHasBeenSet")}
                >
                  Confirm name
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("cancelWorkout")}
                >
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
                    onChange={debouncedExerciseChange}
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
                    placeholder="Reps..."
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
                    placeholder="Sets..."
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
                    placeholder="Weight..."
                    disabled={adding && !loggedIn}
                  ></input>
                </div>
              </div>
              <br></br>

              <button
                className="SquishSize"
                type="button"
                onClick={() => handleAction("finished")}
                disabled={adding && !loggedIn}
              >
                Click to finish workout
              </button>
              <button
                className="SquishSize"
                type="button"
                onClick={() => handleAction("cancelExercise")}
              >
                Click to cancel exercise
              </button>
              <div className="flexContainer spaceNicely">
                <button onClick={() => handleAction("ExerciseFororBack", -1)}>
                  {backExerciseText}
                </button>
                <button onClick={() => handleAction("ExerciseFororBack", 1)}>
                  {forwardExerciseText}
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
              onChange={(e) => handleAction("view", e)}
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
