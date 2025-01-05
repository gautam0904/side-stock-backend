import { Request, Response } from "express";
import { CustomerService } from "../services/customer.service.js";
import { ICustomer } from "../interfaces/customer.interface.js";
import { statuscode } from "../constants/status.js";
import { ERROR_MSG } from "../constants/message.js";

const customerService = new CustomerService();

export const createCustomer = async (req: Request, res: Response) => {
    try {
        const customerData: ICustomer = req.body;
        const createdCustomer = await customerService.createCustomer(customerData);
        res.status(createdCustomer.statuscode).json(createdCustomer);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const customers = await customerService.getCustomers(query);
        res.status(customers.statuscode).json(customers);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const getCustomerByName = async (req: Request, res: Response) => {
    try {
        const customerData = req.query;
        const customer = await customerService.getCustomerByName(customerData);
        res.status(customer.statuscode).json(customer);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const customerData: ICustomer = req.body;
        const updatedCustomer = await customerService.updateCustomer(customerData);
        res.status(updatedCustomer.statuscode).json(updatedCustomer);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const customerData: ICustomer = req.body;
        const deletedCustomer = await customerService.deleteCustomer(customerData);
        res.status(deletedCustomer.statuscode).json(deletedCustomer);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}


