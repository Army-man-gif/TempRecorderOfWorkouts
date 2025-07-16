import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAbfNNxbNCQzp_ec_n4xvf5fD1zVb5S_zo",
  authDomain: "temprecording.firebaseapp.com",
  projectId: "temprecording",
  storageBucket: "temprecording.firebasestorage.app",
  messagingSenderId: "433465160677",
  appId: "1:433465160677:web:075bbef2733a3af388f50c",
  measurementId: "G-GBRJYH26QY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Make function to statically make the absolute parent collection
export async function Users() {
  const TopMostContainer = collection(db, "Users");
}

// Make function to dynamically make user parent document
export async function addUser(Username) {
  const docRef = doc(db, "Users", Username);
  await setDoc(docRef, {});
}

async function getUser(Username) {
  const fetch = await getDocs(collection(db, "Users"));
  fetch.forEach((doc) => {
    if (doc.id === Username) {
      return doc.id;
    }
  });
}
export async function WorkoutDateSubcollection(Username, subcollectionName) {
  const fetch = await getUser(Username);
  if (fetch) {
    const workoutDatesubcollection = collection(
      db,
      "Users",
      fetch,
      subcollectionName,
    );
    return workoutDatesubcollection;
  }
}
export async function numberOfWorkoutsOnThatDate(Username, workoutDate) {
  const fetch = await WorkoutDateSubcollection(Username, workoutDate);
  if (fetch) {
    const fetch2 = await getDocs(fetch);
    return fetch2.size;
  }
  return 0;
}
// Make function to make each workout a subcollection
export async function setNewWorkoutPage(Username, workoutDate) {
  const fetch = await WorkoutDateSubcollection(Username, workoutDate);
  if (fetch) {
    const count = await numberOfWorkoutsOnThatDate(Username, workoutDate);
    if (count) {
      const newID = "workout" + (count + 1);
      const docRef = doc(fetch, newID);
      await setDoc(docRef, {});
    }
  }
}

export async function getWorkoutPage(Username, workoutDate, workoutNumber) {
  const workoutDateWorkouts = await WorkoutDateSubcollection(
    Username,
    workoutDate,
  );
  if (workoutDateWorkouts) {
    const listOfWorkoutsThatDay = await getDocs(workoutDateWorkouts);
    if (listOfWorkoutsThatDay) {
      listOfWorkoutsThatDay.forEach((workout) => {
        if (workout.id == "workout" + workoutNumber) {
          return workout.id;
        }
      });
    }
  }
}

export async function exercisesSubcollection(
  Username,
  workoutDate,
  workoutNumber,
) {
  const fetch = await getUser(Username);
  if (fetch) {
    const exercisesSubcollection = collection(
      db,
      "Users",
      fetch,
      getWorkoutPage(Username, workoutDate, workoutNumber),
      "exercises",
    );
    return exercisesSubcollection;
  }
}

export async function numberOfExercisessInThatWorkout(
  Username,
  workoutDate,
  workoutNumber,
) {
  const fetch = await exercisesSubcollection(
    Username,
    workoutDate,
    workoutNumber,
  );
  if (fetch) {
    const fetch2 = await getDocs(fetch);
    return fetch2.size;
  }
}

export async function setNewExercise(
  Username,
  workoutDate,
  workoutNumber,
  data,
) {
  const fetch = await exercisesSubcollection(
    Username,
    workoutDate,
    workoutNumber,
  );
  if (fetch) {
    const count = await numberOfExercisessInThatWorkout(
      Username,
      workoutDate,
      workoutNumber,
    );
    if (count) {
      const newID = "exercise" + (count + 1);
      const docRef = doc(fetch, newID);
      await setDoc(docRef, data, { merge: true });
    }
  }
}
export async function getExercise(
  Username,
  workoutDate,
  workoutNumber,
  exerciseNumber,
) {
  const exercises = await exercisesSubcollection(
    Username,
    workoutDate,
    workoutNumber,
  );
  if (exercises) {
    const listOfexercisesThatDay = await getDocs(exercises);
    if (listOfexercisesThatDay) {
      listOfexercisesThatDay.forEach((workout) => {
        if (workout.id == "exercise" + exerciseNumber) {
          return workout.id;
        }
      });
    }
  }
}

export async function deleteExercise(
  Username,
  workoutDate,
  workoutNumber,
  exerciseNumber,
) {
  const userID = await getUser(Username);
  const workoutID = await getWorkoutPage(Username, workoutDate, workoutNumber);
  const exerciseID = await getExercise(
    Username,
    workoutDate,
    workoutNumber,
    exerciseNumber,
  );
  if (userID && workoutID && exerciseID) {
    const docRef = doc(
      db,
      "Users",
      userID,
      workoutDate,
      workoutID,
      "exercises",
      exerciseID,
    );
    await deleteDoc(docRef);
  }
}
/*
export async function updateData(id, newData, name) {
  const docRef = doc(db, name, id);
  await updateDoc(docRef, newData);
}

export async function clean(name, id) {
  await deleteDoc(doc(db, name, id));
}

export async function addData(name, id, data) {
  const docRef = doc(db, name, id);
  await setDoc(docRef, data);
}
*/
