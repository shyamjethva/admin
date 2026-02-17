import Shift from "../models/Shift.js";
import { createCrud } from "../controllers/crudfactory.js";
import { makeCrudRouter } from "./crudroutes.js";

const crud = createCrud(Shift);
export default makeCrudRouter(crud, ["admin", "hr"]);
