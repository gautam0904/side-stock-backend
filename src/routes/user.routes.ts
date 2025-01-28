import express from "express";
import { signup ,login} from "../controllers/user.controller.js";

const userRoutes = express.Router();

userRoutes.post('/signup' , signup);
userRoutes.post('/login', login);
userRoutes.post('/login1', login);


export default userRoutes;