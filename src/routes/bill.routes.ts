import express from "express";
import { deleteBill, updateBill, getBill } from "../controllers/bill.controller.js";


const billRoutes = express.Router();

billRoutes.get('/get', getBill);
billRoutes.put('/update/:id', updateBill);
billRoutes.delete('/delete/:id', deleteBill);

export default billRoutes;
    
