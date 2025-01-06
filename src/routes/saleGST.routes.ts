import express from "express";
import { createSale, deleteSale, getSale, getSaleByName, updateSale } from "../controllers/saleGST.controller.js";


const saleRoutes = express.Router();

saleRoutes.post('/create', createSale);
saleRoutes.get('/get', getSale);
saleRoutes.put('/update', updateSale);
saleRoutes.delete('/delete', deleteSale);
saleRoutes.get('/getByName', getSaleByName);

export default saleRoutes;