import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service.js";
import { IPayment } from "../interfaces/payment.interface.js"; 
import { statuscode } from "../constants/status.js";
import { ERROR_MSG } from "../constants/message.js";

const purchaseService = new PaymentService();

export const createPayment = async (req: Request, res: Response) => {
    try {
        const purchaseData: IPayment = req.body;
        const createdPayment = await purchaseService.createPayment(purchaseData);
        res.status(createdPayment.statuscode).json(createdPayment);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const getPayment = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const purchaseBills = await purchaseService.getPayment(query);
        res.status(purchaseBills.statuscode).json(purchaseBills);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const getPaymentByName = async (req: Request, res: Response) => {
    try {
        const purchseData = req.query;
        const purchasBills = await purchaseService.getPaymentByName(purchseData);
        res.status(purchasBills.statuscode).json(purchasBills);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const updatePayment = async (req: Request, res: Response) => {
    try {
        const purchaseData: IPayment = req.body;
console.log(purchaseData)
        const updatedPayment = await purchaseService.updatePayment(purchaseData);
        res.status(updatedPayment.statuscode).json(updatedPayment);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const deletePayment = async (req: Request, res: Response) => {
    try {
        const purchaseId = req.params.id;
        const deletedPayment = await purchaseService.deletePayment(purchaseId);
        res.status(deletedPayment.statuscode).json(deletedPayment);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}


