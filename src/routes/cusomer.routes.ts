import express from "express";
import { deleteCustomer, updateCustomer, getCustomers, getCustomerByName } from "../controllers/customer.controller.js";
import { createCustomer } from "../controllers/customer.controller.js";


const customerRoutes = express.Router();

customerRoutes.post('/create', createCustomer);
customerRoutes.get('/get', getCustomers);
customerRoutes.put('/update/:id', updateCustomer);
customerRoutes.delete('/delete', deleteCustomer);
customerRoutes.get('/getByName', getCustomerByName);

export default customerRoutes;
    
