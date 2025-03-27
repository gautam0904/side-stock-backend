// gautam

import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import { connectDb } from './db/index.js';
import cors from 'cors';
import userRouter from "./routes/user.routes.js";
import customerRoutes from './routes/customerGST.routes.js';
import purchaseRoutes from './routes/purchaseGST.routes.js';
import saleRoutes from './routes/saleGST.routes.js';
import productRoutes from './routes/product.routes.js';
import challanRoutes from './routes/challan.routes.js';
import billRoutes from './routes/bill.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import msgRoutes from './routes/whatrsapp.routes.js';

dotenv.config();

const app : express.Application = express();

app.use(express.json({limit: "16kb"}));
app.use(urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));

app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/customer", customerRoutes);
app.use("/api/v1/purchase", purchaseRoutes);
app.use("/api/v1/sale", saleRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/challan", challanRoutes);
app.use("/api/v1/bill", billRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/whatsapp", msgRoutes);

const PORT = process.env.PORT || 4000;

connectDb().then(()=>{
    app.listen(PORT , ()=>{
        console.log(`server is starting on port ${PORT}`);
    })
}).catch((error)=>{
    console.log(error);
    
})

export default app;
