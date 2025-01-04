import User from "../models/user.model.js";
import { errMSG, MSG } from '../constants/message.js';
import { statuscode } from "../constants/status.js";
import jwt from 'jsonwebtoken';
import { IUser } from "../interfaces/user.interface.js";
import { ApiError } from "../utils/apiError.js";
import bcrypt from 'bcrypt'


export class UserService {
    async createUser(user: IUser) {
        const existinguser = await User.find({ Email: user.email });
        if (existinguser.length != 0) {
            throw new ApiError(statuscode.BADREQUEST, errMSG.exsistuser);
        }
        const result = await User.create({
            Name: user.name,
            Email: user.email,
            Password: user.password
        });
        return {
            statuscode: statuscode.CREATED,
            message: MSG.usercreated,
            data: result
        }

    }

    async loginUser(loginData: IUser) {
        const existUser = await User.findOne({ Email: loginData.email });
        if (!existUser) {
            throw new ApiError(statuscode.NOCONTENT, errMSG.userNotFound);
        }

        const isMatch = bcrypt.compare(loginData.password, existUser.password);

        if (!isMatch) {
            throw new ApiError(statuscode.NOTACCEPTABLE, errMSG.passwordNotMatch)
        }

        const token = jwt.sign(
            {
                id: existUser._id,
            },
            process.env.AccessTokenSeceret || 'side',
            {
                expiresIn: process.env.AccessExpire
            });

        return {
            statuscode: statuscode.OK,
            message: MSG.success('User logged in'),
            data: {
                token: token,
                user: existUser
            }
        }

    }

}
