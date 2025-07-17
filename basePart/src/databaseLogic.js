import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  getDoc,
  doc,
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

export async function getUser(Username) {
  const docRef = doc(db, "Users", Username);
  const getDocRef = await getDoc(docRef);
  return getDocRef.exists() ? Username : null;
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
    if (count || count === 0) {
      const newID = "workout" + (count + 1);
      const docRef = doc(fetch, newID);
      await setDoc(docRef, {});
    }
  }
}

export async function getMostRecentWorkoutPage(Username, workoutDate) {
  const number = await numberOfWorkoutsOnThatDate(Username, workoutDate);
  if (number) {
    return number;
  }
}
export async function getWorkoutPage(Username, workoutDate, workoutNumber) {
  const subcollection = await WorkoutDateSubcollection(Username, workoutDate);
  const docRef = doc(subcollection, "workout" + workoutNumber);
  const getDocRef = await getDoc(docRef);
  return getDocRef.exists() ? docRef.id : null;
}
export async function exercisesSubcollection(
  Username,
  workoutDate,
  workoutNumber,
) {
  const fetch = await getUser(Username);
  if (fetch) {
    const workoutPageID = await getWorkoutPage(
      Username,
      workoutDate,
      workoutNumber,
    );
    const workoutDatesubcollection = await WorkoutDateSubcollection(
      Username,
      workoutDate,
    );
    if (workoutPageID && workoutDatesubcollection) {
      const exercisesSubcollection = collection(
        db,
        "Users",
        fetch,
        workoutDate,
        workoutPageID,
        "exercises",
      );
      return exercisesSubcollection;
    }
  }
}
export async function deleteWorkoutPage(Username, workoutDate, workoutNumber) {
  const subcollection = await WorkoutDateSubcollection(Username, workoutDate);
  if (subcollection) {
    const docRef = doc(subcollection, "workout" + workoutNumber);
    const exerciseSub = await exercisesSubcollection(
      Username,
      workoutDate,
      workoutNumber,
    );
    if (exerciseSub) {
      const getsubcollection = await getDocs(exerciseSub);
      if (getsubcollection) {
        for (const snap of getsubcollection.docs) {
          await deleteDoc(snap.ref);
        }
        const workoutRef = doc(
          db,
          "Users",
          Username,
          workoutDate,
          "workout" + workoutNumber,
        );
        await deleteDoc(workoutRef);
      }
    }
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
    if (count || count === 0) {
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
  const subcollection = await exercisesSubcollection(
    Username,
    workoutDate,
    workoutNumber,
  );
  const docRef = doc(subcollection, "exercise" + exerciseNumber);
  const getDocRef = await getDoc(docRef);
  return getDocRef.exists() ? docRef.id : null;
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
