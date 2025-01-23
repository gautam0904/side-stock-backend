import express from "express";
import { deletePayment, updatePayment, getPayment, getPaymentByName, createPayment } from "../controllers/payment.controller.js";

const paymentRoutes = express.Router();

paymentRoutes.post('/create',createPayment);
paymentRoutes.get('/get', getPayment);
paymentRoutes.put('/update/:id', updatePayment);
paymentRoutes.delete('/delete/:id', deletePayment);
paymentRoutes.get('/getByName/:name', getPaymentByName);

export default paymentRoutes;

