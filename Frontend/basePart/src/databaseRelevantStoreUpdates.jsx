import {
  getTodayKey,
  checkPrivateBrowsing,
} from "./BasicCheckingAndFormatting.jsx";

export function saveDataStore(
  wName,
  dateToChangeWorkoutStateListsWith,
  ex,
  replace,
  target,
  timezone,
) {
  const todayKey = getTodayKey(timezone);
  let dataPool = {};
  if (!checkPrivateBrowsing) {
    dataPool = JSON.parse(localStorage.getItem("data")) || {};
  } else {
    dataPool = JSON.parse(sessionStorage.getItem("data")) || {};
  }

  if (!(todayKey in dataPool)) {
    dataPool[todayKey] = {};
  }
  if (!(wName in dataPool[todayKey])) {
    dataPool[todayKey][wName] = [];
  }
  let changeExerciseIndexinDataPool = -1;
  if (replace) {
    changeExerciseIndexinDataPool = dataPool[todayKey][wName].findIndex(
      (exercise) => exercise.name === target,
    );
  } else {
    changeExerciseIndexinDataPool = dataPool[todayKey][wName].findIndex(
      (exercise) => exercise.name === ex,
    );
  }
  if (changeExerciseIndexinDataPool >= 0) {
    dataPool[todayKey][wName][changeExerciseIndexinDataPool] =
      dateToChangeWorkoutStateListsWith;
  } else {
    dataPool[todayKey][wName].push(dateToChangeWorkoutStateListsWith);
  }

  if (!checkPrivateBrowsing) {
    localStorage.setItem("data", JSON.stringify(dataPool));
  } else {
    sessionStorage.setItem("data", JSON.stringify(dataPool));
  }
}
export function saveWorkoutData(wName, data, ex, replace, target, timezone) {
  let stored = {};
  if (!checkPrivateBrowsing) {
    stored = JSON.parse(localStorage.getItem("workouts")) || {};
  } else {
    stored = JSON.parse(sessionStorage.getItem("workouts")) || {};
  }
  if (!(wName in stored)) {
    stored[wName] = [];
  }

  let changeExerciseIndex = -1;
  if (replace) {
    changeExerciseIndex = stored[wName].findIndex(
      (exercise) => exercise.name === target,
    );
  } else {
    changeExerciseIndex = stored[wName].findIndex(
      (exercise) => exercise.name === ex,
    );
  }
  if (changeExerciseIndex >= 0) {
    stored[wName][changeExerciseIndex] = data;
  } else {
    stored[wName].push(data);
  }

  if (!checkPrivateBrowsing) {
    localStorage.setItem("workouts", JSON.stringify(stored));
    localStorage.setItem("timezone", JSON.stringify(timezone));
  } else {
    sessionStorage.setItem("workouts", JSON.stringify(stored));
    sessionStorage.setItem("timezone", JSON.stringify(timezone));
  }
}
