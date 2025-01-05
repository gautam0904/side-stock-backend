import { Request, Response } from "express";
import { PurchaseService } from "../services/purchase.service.js";
import { IPurchase } from "../interfaces/purchase.interface.js"; 
import { statuscode } from "../constants/status.js";
import { ERROR_MSG } from "../constants/message.js";

const purchaseService = new PurchaseService();

export const createPurchase = async (req: Request, res: Response) => {
    try {
        const purchaseData: IPurchase = req.body;
        const createdPurchase = await purchaseService.createPurchase(purchaseData);
        res.status(createdPurchase.statuscode).json(createdPurchase);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const getPurchase = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const purchaseBills = await purchaseService.getPurchase(query);
        res.status(purchaseBills.statuscode).json(purchaseBills);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const getPurchaseByName = async (req: Request, res: Response) => {
    try {
        const purchseData = req.query;
        const purchasBills = await purchaseService.getPurchaseByName(purchseData);
        res.status(purchasBills.statuscode).json(purchasBills);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const updateParchase = async (req: Request, res: Response) => {
    try {
        const purchaseData: IPurchase = req.body;
        const updatedPurchase = await purchaseService.updatePurchase(purchaseData);
        res.status(updatedPurchase.statuscode).json(updatedPurchase);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const deletePurchase = async (req: Request, res: Response) => {
    try {
        const purchaseId = req.body;
        const deletedPurchase = await purchaseService.deleteCustomer(purchaseId);
        res.status(deletedPurchase.statuscode).json(deletedPurchase);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}


