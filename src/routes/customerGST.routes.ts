import express from "express";
import { deleteCustomer, updateCustomer, getCustomers, getCustomerByName } from "../controllers/customerGST.controller.js";
import { createCustomer } from "../controllers/customerGST.controller.js";
import { upload } from "../middleware/multer.middlewares.js";


const customerRoutes = express.Router();

customerRoutes.post('/create',
  upload.fields([
    { name: "aadharPhoto", maxCount: 1 },
    { name: "panCardPhoto", maxCount: 1 },
    { name: "customerPhoto", maxCount: 1 }
  ]),
  createCustomer
);
customerRoutes.get('/get', getCustomers);
customerRoutes.put('/update/:id', updateCustomer);
customerRoutes.delete('/delete/:id', deleteCustomer);
customerRoutes.get('/getByName', getCustomerByName);

export default customerRoutes;

