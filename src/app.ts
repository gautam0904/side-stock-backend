import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import { connectDb } from './db/index.js';
import cors from 'cors';

dotenv.config();

const app : express.Application = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

const PORT = process.env.PORT || 4000;

connectDb().then(()=>{
    app.listen(PORT , ()=>{
        console.log(`server is starting on port ${PORT}`);
    })
}).catch((error)=>{
    console.log(error);
    
})

app.use(express.json({limit: "16kb"}));
app.use(urlencoded({extended:true,limit: "16kb"}));
app.use(express.static("public"));

// routes
import userRouter from "./routes/user.routes.js"

app.use("/api/v1/user", userRouter)


export default app;