import { Request, Response } from "express";
import { Iuser } from "../interfaces/user.interface";
import { UserService } from "../services/user.service";
import { statuscode } from "../constants/status";
import { errMSG } from "../constants/message";

const userService = new UserService();

export const signup = async (req: Request, res: Response) => {
    try {
        const signupData: Iuser = req.body;
        const createdUser = await userService.createUser(signupData);
        res.status(createdUser.statuscode).json(createdUser);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR)
            .json({ message: error.message || errMSG.InternalServerErrorResult, data: error });
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const loginData: Iuser = req.body;
        const loginUser = await userService.loginUser(loginData);
        res.status(loginUser.statuscode).json(loginUser);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR)
        .json({ message: error.message || errMSG.InternalServerErrorResult, data: error });
    }
}

