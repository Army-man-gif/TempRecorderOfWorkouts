import {
  getData,
  addData,
  clean,
  updateData,
  cleanAll,
} from "./databaseLogic.js";
import { useState } from "react";
function Record() {
  const [user, setUser] = useState(() => prompt("Enter your name"));
}

export default Record;
