import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";


declare global {
    namespace Express {
        interface Request {
            decoded?: jwt.JwtPayload;
            accessToken?: string;
        }
    }
}

export const authmiddle = async (req: Request, res: Response, next: NextFunction) => {
    const AccessToken = req.headers.authorization    
    
    if (!AccessToken) {
        return res.status(401).json({
            message: "You have not token"
        });
    }
    const accesstoken : jwt.Secret = (AccessToken as string).split(" ")[1];
    const seceretKey = process.env.ACCESSTOKENSECERET || 'side'
    jwt.verify(accesstoken, (seceretKey as jwt.Secret), (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: "You are not authorized",
                err
            })
        }
        else {
            (req as jwt.JwtPayload).decoded = decoded;
            next();
        }
    });
};