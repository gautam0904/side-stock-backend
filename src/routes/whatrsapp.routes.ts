import express from "express";
import { sendMessage } from "../controllers/whatsapp.controller.js";
import { upload } from "../middleware/multer.middlewares.js";

const msgRoutes = express.Router();

msgRoutes.post('/send-message', upload.fields([
    { name: "file", maxCount: 1 },
]), sendMessage);


export default msgRoutes;