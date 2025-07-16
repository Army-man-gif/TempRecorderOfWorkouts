import { useDrop } from "react-use";

import { Users, addUser, getUser } from "./databaseLogic.js";

import { useEffect, useState } from "react";
function Record() {
  const today = new Date().toISOString().split("T")[0];
  const [user, setUser] = useState(() => prompt("Enter your username"));
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
  async function createNewWorkout() {}
  return (
    <>
      <button type="button" onClick={add}>
        Click to add a new workout
      </button>
      <form>
        <label for="workoutPick">Pick workout date: </label>
        <input type="date" id="workoutPick" name="workoutPick"></input>
        <button type="submit"></button>
      </form>
    </>
  );
}

export default Record;
