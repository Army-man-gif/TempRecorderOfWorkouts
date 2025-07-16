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
export async function SpecificUser(Username) {
  const TopMostContainer = collection(db, "Users");
  const docRef = addDoc(TopMostContainer, {
    name: { Username },
  });
}

/*
 Make function to dynamically make workouts' child 
 subcollection of the user parent document
 to represent history of workouts
 This needs to use date to ID it, partially
*/

// Make function to make each workout

export async function updateData(id, newData, name) {
  const docRef = doc(db, name, id);
  await updateDoc(docRef, newData);
}
export async function cleanAll(name) {
  try {
    const fetch = await getDocs(collection(db, name));
    await Promise.all(fetch.docs.map((doc) => deleteDoc(doc.ref)));
  } catch (error) {
    console.error("Error cleaning all documents:", error);
    throw error;
  }
}
export async function clean(name, id) {
  await deleteDoc(doc(db, name, id));
}
export async function getData(name) {
  const fetch = await getDocs(collection(db, name));
  const data = [];
  fetch.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });
  return data;
}
export async function addData(name, id, data) {
  const docRef = doc(db, name, id);
  await setDoc(docRef, data);
}
