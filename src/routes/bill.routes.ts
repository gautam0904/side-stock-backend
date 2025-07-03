import express from "express";
import { deleteBill, updateBill, getBill } from "../controllers/bill.controller.js";
import { authmiddle } from "../middleware/auth.middleware.js";


const billRoutes = express.Router();

billRoutes.get('/get',authmiddle,  getBill);
billRoutes.put('/update/:id', authmiddle, updateBill);
billRoutes.delete('/delete/:id', authmiddle, deleteBill);

export default billRoutes;
    
