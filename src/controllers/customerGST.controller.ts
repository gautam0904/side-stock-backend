import { Request, Response } from "express";
import { CustomerGSTService } from "../services/customerGST.service.js";
import { ICustomerGST } from "../interfaces/customerGST.interface.js";
import { statuscode } from "../constants/status.js";
import { ERROR_MSG } from "../constants/message.js";

const customerGSTService = new CustomerGSTService();

export const createCustomer = async (req: Request, res: Response) => {
    try {
        const customerData: ICustomerGST = req.body;
        const createdCustomer = await customerGSTService.createCustomer(customerData);
        res.status(createdCustomer.statuscode).json(createdCustomer);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const customers = await customerGSTService.getCustomers(query);
        res.status(customers.statuscode).json(customers);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const getCustomerByName = async (req: Request, res: Response) => {
    try {
        const customerData = req.query;
        const customer = await customerGSTService.getCustomerByName(customerData);
        res.status(customer.statuscode).json(customer);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const customerData: ICustomerGST = req.body;
        const updatedCustomer = await customerGSTService.updateCustomer(customerData);
        res.status(updatedCustomer.statuscode).json(updatedCustomer);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const deleteCustomer = async (req: Request, res: Response) => {
    try {
         const customerId = req.params.id;       
        const deletedCustomer = await customerGSTService.deleteCustomer(customerId);
        res.status(deletedCustomer.statuscode).json(deletedCustomer);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}


