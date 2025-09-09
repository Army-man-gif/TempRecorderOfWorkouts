const intialBackendString = "https://workoutsBackend-qta1.onrender.com/records";
import { getCookieFromBrowser } from "./auth.js";
function isPrivateBrowsing() {
  try {
    localStorage.setItem("__test__", "1");
    localStorage.removeItem("__test__");
    return false;
  } catch {
    return true;
  }
}
function authenticationHeaders() {
  const sessionid = JSON.parse(sessionStorage.getItem("sessionid"));
  const csrftoken = JSON.parse(sessionStorage.getItem("csrftoken"));

  return {
    "Content-Type": "application/json",
    "X-SESSIONID": sessionid || "",
    "X-CSRFToken": csrftoken || "",
  };
}
export async function SendData(url, data = {}) {
  let response;
  try {
    const sendData = await fetch(url, {
      method: "POST",
      headers: authenticationHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
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

export async function User() {
  const Username = prompt("Enter username: ");
  const passkey = prompt("Enter passkey: ");
  const data = { username: Username, passkey: passkey };
  const csrftoken = await getCookieFromBrowser();
  sessionStorage.setItem("csrftoken", JSON.stringify(csrftoken));
  const user = await SendData(`${intialBackendString}/GetorMakeUser/`, data);
  if (user["status"]) {
    console.log("Logged in");
    const sessionid = user["sessionid"];
    sessionStorage.setItem("sessionid", JSON.stringify(sessionid));
    if (!isPrivateBrowsing()) {
      localStorage.setItem("username", JSON.stringify(user["username"]));
      localStorage.setItem("passkey", JSON.stringify(user["passkey"]));
    } else {
      sessionStorage.setItem("username", JSON.stringify(user["username"]));
      sessionStorage.setItem("passkey", JSON.stringify(user["passkey"]));
    }
  } else {
    console.log("Login failed");
  }
}
export async function justLogin(name, passkey) {
  const data = { username: name, passkey: passkey };
  const csrftoken = await getCookieFromBrowser();
  sessionStorage.setItem("csrftoken", JSON.stringify(csrftoken));
  const user = await SendData(`${intialBackendString}/login/`, data);
  if (user.message) {
    const sessionid = user["sessionid"];
    sessionStorage.setItem("sessionid", JSON.stringify(sessionid));
    console.log("Login worked");
  } else {
    console.log("Login failed");
  }
}

export async function batchupdateExercise() {
  let stored = {};
  let privateBrowsing = false;
  if (!isPrivateBrowsing()) {
    stored = JSON.parse(localStorage.getItem("workouts")) || {};
  } else {
    stored = JSON.parse(sessionStorage.getItem("workouts")) || {};
    privateBrowsing = true;
  }
  const data = { batchUpdate: stored };
  const updateInBulk = await SendData(
    `${intialBackendString}/batchupdateExercise/`,
    data,
  );
  if (updateInBulk.message) {
    console.log(updateInBulk.message);
    if (!privateBrowsing) {
      localStorage.setItem("batchUpdateSuccess", JSON.stringify(true));
      localStorage.setItem("workouts", JSON.stringify({}));
    } else {
      sessionStorage.setItem("workouts", JSON.stringify({}));
    }
  } else {
    if (!privateBrowsing) {
      localStorage.setItem("batchUpdateSuccess", JSON.stringify(false));
    }
  }
}
export async function logout() {
  const loggingout = await SendData(`${intialBackendString}/logout/`);
  if (loggingout.message) {
    console.log("Logged out");
  }
}

export async function getExercisesofThatDate(date) {
  const data = { date: date };
  console.log(date);
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

export async function getAll() {
  const getItAll = await SendData(`${intialBackendString}/getAll/`);
  console.log("Raw getAll response:", getItAll);
  if (getItAll) {
    if (getItAll["message"]) {
      console.log("Exercises collected", getItAll["data"]);

      return getItAll["data"];
    }
  } else {
    return {};
  }
}
