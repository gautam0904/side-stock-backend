import User from "../models/user.model.js";
import { ERROR_MSG, MSG } from '../constants/message.js';
import { statuscode } from "../constants/status.js";
import jwt from 'jsonwebtoken';
import { IUser } from "../interfaces/user.interface.js";
import { ApiError } from "../utils/apiError.js";
import bcrypt from 'bcrypt'

interface UserDocument {
    password?: string;
    [key: string]: any;
}

export class UserService {
    async createUser(user: IUser) {
        try {
            const existinguser = await User.findOne({ 
                name: user.name.toLowerCase()
            });
            
            if (existinguser) {
                throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.EXISTS('User'));
            }

            // Create user with lowercase fields
            const result = await User.create({
                name: user.name,
                password: user.password,
		        type: user.type
            })

            const userResponse = result.toObject() as { password?: string, [key: string]: any };
            delete userResponse.password;

            return {
                statuscode: statuscode.CREATED,
                message: MSG.USER_CREATED,
                data: userResponse
            }
        } catch (error) {
            throw new ApiError(
                error.statuscode || statuscode.INTERNALSERVERERROR,
                error.message || ERROR_MSG.DEFAULT_ERROR
            );
        }
    }

    async loginUser(loginData: IUser) {
        try {
            const existUser = await User.findOne({ 
                name: loginData.name.toLowerCase()
            });
            
            if (!existUser) {
                throw new ApiError(statuscode.NOCONTENT, ERROR_MSG.USER_NOT_FOUND);
            }

            const isMatch = await bcrypt.compare(loginData.password, existUser.password);

            if (!isMatch) {
                throw new ApiError(statuscode.NOTACCEPTABLE, ERROR_MSG.PASSWORD_MISMATCH)
            }

            const token = jwt.sign(
                { id: existUser._id },
                process.env.AccessTokenSeceret || 'side',
                { expiresIn: process.env.AccessExpire || '1d' }
            );

            const userResponse = existUser.toObject() as { password?: string, [key: string]: any };
            delete userResponse.password;

            return {
                statuscode: statuscode.OK,
                message: MSG.SUCCESS('User logged in'),
                data: {
                    token,
                    user: userResponse
                }
            }
        } catch (error) {
            throw new ApiError(
                error.statuscode || statuscode.INTERNALSERVERERROR,
                error.message || ERROR_MSG.DEFAULT_ERROR
            );
        }
    }
}
