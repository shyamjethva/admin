import Department from "../models/Department.js";
import { createCrud } from "../controllers/crudfactory.js";
import { makeCrudRouter } from "./crudroutes.js";

const crud = createCrud(Department);
export default makeCrudRouter(crud, ["admin", "hr"]);
