import Designation from "../models/Designation.js";
import { createCrud } from "../controllers/crudfactory.js";
import { makeCrudRouter } from "./crudroutes.js";

const crud = createCrud(Designation);
export default makeCrudRouter(crud, ["admin", "hr"]);
