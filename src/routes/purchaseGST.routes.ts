import express from "express";
import { createPurchase, deletePurchase, getPurchase, getPurchaseByName, updateParchase } from "../controllers/purchaseGST.controller.js";


const purchaseRoutes = express.Router();

purchaseRoutes.post('/create', createPurchase);
purchaseRoutes.get('/get', getPurchase);
purchaseRoutes.put('/update/:id', updateParchase);
purchaseRoutes.delete('/delete/:id', deletePurchase);
purchaseRoutes.get('/getByName', getPurchaseByName);

export default purchaseRoutes;