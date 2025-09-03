import { ensureCSRFToken } from "./auth.js";
const intialBackendString = "https://workoutsBackend-qta1.onrender.com/records";
export async function SendData(url, data) {
  let response;
  const dataToUse = data;
  console.log(dataToUse);
  let CSRFToken = await ensureCSRFToken();
  try {
    const sendData = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": CSRFToken,
      },
      credentials: "include",
      body: JSON.stringify(dataToUse),
    });
    const contentType = sendData.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      response = await sendData.json();
    } else {
      response = await sendData.text();
    }
    if (sendData.ok) {
      //console.log("Server responded with: ", response);
      sessionStorage.setItem("Logged-In", true);
    } else {
      console.log("Server threw an error", response);
    }
  } catch (error) {
    console.log("Error: ", error);
  }
  return response;
}
//   if (user["status"] === "User created" || user["status"] === "User fetched") {

export async function User() {
  const Username = prompt("Enter username: ");
  const passkey = prompt("Enter passkey: ");
  const data = { username: Username, passkey: passkey };
  const user = await SendData(`${intialBackendString}/GetorMakeUser/`, data);
  if (user["status"]) {
    console.log("Logged in");
    localStorage.setItem("username", JSON.stringify(user["username"]));
    localStorage.setItem("passkey", JSON.stringify(user["passkey"]));
  } else {
    console.log("Login failed");
  }
}
export async function justLogin(name, passkey) {
  const data = { username: name, passkey: passkey };
  const user = await SendData(`${intialBackendString}/login/`, data);
  if (user.message) {
    console.log("Login worked");
  } else {
    console.log("Login failed");
  }
}
export async function updateExercise(data) {
  // workoutName,exerciseName,exerciseReps,exerciseSets,exerciseWeight
  const changeOraddExercise = await SendData(
    `${intialBackendString}/updateExercise/`,
    data,
  );
  if (changeOraddExercise.message) {
    console.log("Exercise changed/added");
  }
}
export async function batchupdateExercise() {
  const stored = JSON.parse(localStorage.getItem("workouts")) || {};
  const data = { batchUpdate: stored };
  const updateInBulk = await SendData(
    `${intialBackendString}/batchupdateExercise/`,
    data,
  );
  if (updateInBulk.message) {
    console.log(updateInBulk.message);
    localStorage.setItem("workouts", JSON.stringify({}));
  }
}
export async function logout() {
  const loggingout = await SendData(`${intialBackendString}/logout/`, {});
  if (loggingout.message) {
    console.log("Logged out");
  }
}

export async function getExercisesofThatDate(date) {
  const data = { date: date };
  const collectingExercises =
    (await SendData(
      `${intialBackendString}/getAllExercisesbasedOnDate/`,
      data,
    )) ?? {};
  if (collectingExercises) {
    if (collectingExercises["message"]) {
      console.log("Exercises collected", collectingExercises["data"]);
      return collectingExercises["data"];
    }
  } else {
    return {};
  }
}

export async function getAll() {}
