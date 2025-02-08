import { Request, Response } from "express";
import { CustomerService } from "../services/customer.service.js";
import { ICustomerGST } from "../interfaces/customerGST.interface.js";
import { statuscode } from "../constants/status.js";
import { ERROR_MSG } from "../constants/message.js";
import { ICustomer } from "../interfaces/nonGSTmodels.interface.js";
import fs from 'fs';

const customerGSTService = new CustomerService();

export const createCustomer = async (req: Request, res: Response) => {
    let aadharPhoto = '';
    let panCardPhoto = '';
    let customerPhoto='';
    try {
        const customerData: ICustomer = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // Store the file paths relative to the server URL
        aadharPhoto = customerData.aadharPhoto =files?.aadharPhoto?.[0].path;
        panCardPhoto = customerData.panCardPhoto = files?.panCardPhoto?.[0].path;
        customerPhoto = customerData.customerPhoto = files?.customerPhoto?.[0].path

        // Parse JSON strings if needed
        if (typeof customerData.prizefix === 'string') {
            customerData.prizefix = JSON.parse(customerData.prizefix);
        }
        if (typeof customerData.sites === 'string') {
            customerData.sites = JSON.parse(customerData.sites);
        }

        const createdCustomer = await customerGSTService.createCustomer(customerData);
        res.status(createdCustomer.statuscode).json(createdCustomer);
    } catch (error) {
        if (fs.existsSync(aadharPhoto)) {
            fs.unlinkSync(aadharPhoto);
          }
        if (fs.existsSync(panCardPhoto)) {
            fs.unlinkSync(panCardPhoto);
          }
        if (fs.existsSync(customerPhoto)) {
            fs.unlinkSync(customerPhoto);
          }
        console.error('Error in createCustomer:', error);
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ 
            message: error.message || ERROR_MSG.DEFAULT_ERROR, 
            data: error 
        });
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
        const customerData = req.params;
        const customer = await customerGSTService.getCustomerByName(customerData);
        res.status(customer.statuscode).json(customer);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const customerData: ICustomer = req.body;
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


