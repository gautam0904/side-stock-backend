import { Request, Response } from "express";
import { ChallanService } from "../services/challan.service.js";
import { IChallan } from "../dto/req.dto.js";
import { statuscode } from "../constants/status.js";
import { ERROR_MSG } from "../constants/message.js";

const challanService = new ChallanService();

export const createChallan = async (req: Request, res: Response) => {
    try {
        const challanData: IChallan = req.body;
        const createdChallan = await challanService.createChallan(challanData);
        res.status(createdChallan.statuscode).json(createdChallan);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const getChallan = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const challans = await challanService.getChallan(query);
        res.status(challans.statuscode).json(challans);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const updateChallan = async (req: Request, res: Response) => {
    try {
        const challanData: IChallan = req.body;
        const updatedChallan = await challanService.updateChallans(challanData);
        res.status(updatedChallan.statuscode).json(updatedChallan);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const deleteChallan = async (req: Request, res: Response) => {
    try {
        const challanId = req.params.id;
        const deletedChallan = await challanService.deleteChallan(challanId);
        res.status(deletedChallan.statuscode).json(deletedChallan);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}


