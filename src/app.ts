import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import { connectDb } from './db/index.js';
import cors from 'cors';
import userRouter from "./routes/user.routes.js";
import customerRoutes from './routes/customerGST.routes.js';
import purchaseRoutes from './routes/purchaseGST.routes.js';

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

const PORT = process.env.PORT || 4000;

connectDb().then(()=>{
    app.listen(PORT , ()=>{
        console.log(`server is starting on port ${PORT}`);
    })
}).catch((error)=>{
    console.log(error);
    
})

export default app;