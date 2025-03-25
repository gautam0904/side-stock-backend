import { Request, Response } from "express";
import { WhatsappService } from "../services/whatsapp.service.js";
import { statuscode } from "../constants/status.js";
import { ERROR_MSG } from "../constants/message.js";

const whatsappService = new WhatsappService();

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { to, body } = req.body;
        
        // Get file path from multer
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const filePath = files?.file?.[0]?.path;
        
        console.log(`Sending WhatsApp message to ${to} ${filePath ? 'with attachment' : 'without attachment'}`);
        
        // Validate phone number
        if (!to || to.trim().length < 10) {
            return res.status(statuscode.BADREQUEST).json({
                statuscode: statuscode.BADREQUEST,
                message: "Valid phone number is required"
            });
        }
        
        // Send the message
        const sentMSG = await whatsappService.sendmessage(to, body, filePath);
        res.status(sentMSG.statuscode).json(sentMSG);
    } catch (error) {
        console.error("WhatsApp controller error:", error);
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR)
            .json({ 
                message: error.message || ERROR_MSG.DEFAULT_ERROR, 
                data: error,
                statuscode: error.statuscode || statuscode.INTERNALSERVERERROR
            });
    }
}
