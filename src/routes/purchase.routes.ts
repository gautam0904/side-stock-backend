import express from "express";
import { createPurchase, deletePurchase, getPurchase, getPurchaseByName, updateParchase } from "../controllers/purchase.controller.js";


const purchaseRoutes = express.Router();

purchaseRoutes.post('/create', createPurchase);
purchaseRoutes.get('/get', getPurchase);
purchaseRoutes.put('/update', updateParchase);
purchaseRoutes.delete('/delete', deletePurchase);
purchaseRoutes.get('/getByName', getPurchaseByName);

export default purchaseRoutes;