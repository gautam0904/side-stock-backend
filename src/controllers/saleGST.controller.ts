import { Request, Response } from "express";
import { SaleService } from "../services/saleGST.service.js";
import { ISale } from "../interfaces/saleGST.interface.js"; 
import { statuscode } from "../constants/status.js";
import { ERROR_MSG } from "../constants/message.js";

const saleService = new SaleService();

export const createSale = async (req: Request, res: Response) => {
    try {
        const saleData: ISale = req.body;
        const createdSale = await saleService.createSale(saleData);
        res.status(createdSale.statuscode).json(createdSale);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const getSale = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const saleBills = await saleService.getSale(query);
        res.status(saleBills.statuscode).json(saleBills);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const getSaleByName = async (req: Request, res: Response) => {
    try {
        const saleData = req.query;
        const saleBills = await saleService.getSaleByName(saleData);
        res.status(saleBills.statuscode).json(saleBills);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const updateSale = async (req: Request, res: Response) => {
    try {
        const saleData: ISale = req.body;
        const updatedSale = await saleService.updateSale(saleData);
        res.status(updatedSale.statuscode).json(updatedSale);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const deleteSale = async (req: Request, res: Response) => {
    try {
        const saleId = req.body;
        const deletedSale = await saleService.deleteSale(saleId);
        res.status(deletedSale.statuscode).json(deletedSale);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}


