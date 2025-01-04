import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import { connectDb } from './db/index.js';
import cors from 'cors';
import userRouter from "./routes/user.routes.js";

dotenv.config();

const app : express.Application = express();
app.use(cors({
    origin: '*', // Your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 3031;

connectDb().then(()=>{
    app.listen(PORT , ()=>{
        console.log(`server is starting on port ${PORT}`);
    })
}).catch((error)=>{
    console.log(error);
    
})

// Then other middleware
app.use(express.json({limit: "16kb"}));
app.use(urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));

app.use("", userRouter)


export default app;