import express from "express";
import { signup ,login} from "../controllers/user.controller";

const userRoutes = express.Router();

userRoutes.post('/signup' , signup);
userRoutes.get('/login',login)

export default userRoutes;