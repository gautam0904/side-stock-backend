import express from "express";
import { deleteChallan, updateChallan, getChallan,createChallan } from "../controllers/challan.controller.js";
import { authmiddle } from "../middleware/auth.middleware.js";


const challanRoutes = express.Router();

challanRoutes.post('/create', authmiddle,createChallan);
challanRoutes.get('/get', authmiddle, getChallan);
challanRoutes.put('/update/:id', authmiddle, updateChallan);
challanRoutes.delete('/delete/:id', authmiddle, deleteChallan);

export default challanRoutes;
    
