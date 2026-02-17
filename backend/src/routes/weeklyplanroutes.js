import WeeklyPlan from "../models/WeeklyPlan.js";
import { createCrud } from "../controllers/crudfactory.js";
import { makeCrudRouter } from "./crudroutes.js";

const crud = createCrud(WeeklyPlan, "employeeId");
export default makeCrudRouter(crud, ["admin", "hr", "employee"]);
