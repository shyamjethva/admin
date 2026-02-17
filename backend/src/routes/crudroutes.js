import { Router } from "express";
import { protect } from "../middleware/authmiddleware.js";
import { allowRoles } from "../middleware/rolemiddleware.js";

export const makeCrudRouter = (crud, roles = ["admin", "hr"]) => {
    const r = Router();
    r.use(protect);

    r.post("/", allowRoles(...roles), crud.create);
    r.get("/", allowRoles(...roles), crud.list);
    r.get("/:id", allowRoles(...roles), crud.get);
    r.put("/:id", allowRoles(...roles), crud.update);
    r.delete("/:id", allowRoles(...roles), crud.remove);

    return r;
};
