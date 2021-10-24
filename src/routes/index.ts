import { Router } from "express";
import {
  getMenus,
  addMenu,
  updateMenu,
  deleteMenu,
  retrieveMenu,
} from "../controllers/menus";
import {
  registerUser
} from "../controllers/users";

const menuRoutes: Router = Router();

const userRoutes: Router = Router()

// Menu Routes

menuRoutes.get("/menu", getMenus);
menuRoutes.post("/menu", addMenu);
menuRoutes.put("/menu/:id", updateMenu);
menuRoutes.delete("/menu/:id", deleteMenu);
menuRoutes.get("/menu/:id", retrieveMenu);

// User Routes

userRoutes.post("/user/register", registerUser);

export {menuRoutes, userRoutes};
