import express from "express";
import { deleteCustomer, updateCustomer, getCustomers, getCustomerByName } from "../controllers/customerGST.controller.js";
import { createCustomer } from "../controllers/customerGST.controller.js";


const customerRoutes = express.Router();

customerRoutes.post('/create', createCustomer);
customerRoutes.get('/get', getCustomers);
customerRoutes.put('/update/:id', updateCustomer);
customerRoutes.delete('/delete/:id', deleteCustomer);
customerRoutes.get('/getByName', getCustomerByName);

export default customerRoutes;
    
