import { Request, Response } from "express";
import { BillService } from "../services/bill.service.js";
import { IBill } from "../interfaces/bill.interface.js";
import { statuscode } from "../constants/status.js";
import { ERROR_MSG } from "../constants/message.js";

const billService = new BillService();

export const createBill = async (req: Request, res: Response) => {
    try {
        const billData: IBill = req.body;
        const createdBill = await billService.createBill(billData);
        res.status(createdBill.statuscode).json(createdBill);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const getBill = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const bills = await billService.getBill(query);
        res.status(bills.statuscode).json(bills);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const updateBill = async (req: Request, res: Response) => {
    try {
        const billData: IBill = req.body;
        const updatedBill = await billService.updateBills(billData);
        res.status(updatedBill.statuscode).json(updatedBill);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const deleteBill = async (req: Request, res: Response) => {
    try {
        const billId = req.params.id;
        const deletedBill = await billService.deleteBill(billId);
        res.status(deletedBill.statuscode).json(deletedBill);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}