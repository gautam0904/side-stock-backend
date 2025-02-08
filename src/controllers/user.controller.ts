import { Request, Response } from "express";
import { IUser } from "../interfaces/user.interface.js";
import { UserService } from "../services/user.service.js";
import { statuscode } from "../constants/status.js";
import { ERROR_MSG } from "../constants/message.js";

const userService = new UserService();

export const signup = async (req: Request, res: Response) => {
    try {
        const signupData: IUser = req.body;
        const createdUser = await userService.createUser(signupData);
        res.status(createdUser.statuscode).json(createdUser);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR)
            .json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const loginData: IUser = req.body;
        const loginUser = await userService.loginUser(loginData);
        res.status(loginUser.statuscode).json(loginUser);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR)
        .json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

