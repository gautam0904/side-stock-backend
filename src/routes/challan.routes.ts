import express from "express";
import { deleteChallan, updateChallan, getChallan,createChallan } from "../controllers/challan.controller.js";


const challanRoutes = express.Router();

challanRoutes.post('/create', createChallan);
challanRoutes.get('/get', getChallan);
challanRoutes.put('/update/:id', updateChallan);
challanRoutes.delete('/delete/:id', deleteChallan);

export default challanRoutes;
    
