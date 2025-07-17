import { useDrop } from "react-use";

import {
  Users,
  addUser,
  getUser,
  setNewWorkoutPage,
  setNewExercise,
  deleteWorkoutPage,
  deleteExercise,
} from "./databaseLogic.js";

import { useEffect, useState } from "react";
function Record() {
  const [user, setUser] = useState(() => prompt("Enter your username"));
  const [curDate, setCurDate] = "";
  useEffect(() => {
    async function load() {
      await Users();
      const lookFor = await getUser(user);
      if (!lookFor) {
        await addUser(user);
      }
    }
    alert(
      `This username is to be kept private. If you reveal this to others,
      they can access and alter your data. 
      If you need to see ur username again for remembering type 
      Yes in the following prompt`,
    );
    const confirm = prompt("Yes or No?");
    if (confirm == "Yes") {
      alert(user);
    }
    load(user);
  }, [user]);
  async function createNewWorkout() {
    const today = new Date().toISOString().split("T")[0];
    if (curDate != "" && curDate != today) {
      setCurDate(today);
    }
    const workout1 = await setNewWorkoutPage(user, curDate);
    const workout2 = await setNewWorkoutPage(user, curDate);
    const exercise1 = await setNewExercise(user, curDate, 2, {
      reps: 5,
    });
    const deleteW = await deleteWorkoutPage(user, curDate, 1);
  }
  return (
    <>
      <button type="button" onClick={createNewWorkout}>
        Click to add a new workout
      </button>
      <form>
        <label htmlFor="workoutPick">Pick workout date: </label>
        <input type="date" id="workoutPick" name="workoutPick"></input>
        <button type="submit"></button>
      </form>
    </>
  );
}

export default Record;
