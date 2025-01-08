import { Request, Response, NextFunction } from "express";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: Function) {
    cb(null, "./public");
  },
  filename: function (reqm, file, cb) {
    cb(null, file.originalname);
  }
});

export const upload = multer({
  storage
});
