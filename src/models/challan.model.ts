import mongoose from "mongoose";
import { ERROR_MSG } from "../constants/message.js";

const saleSchema = new mongoose.Schema({
    challenType: {
        type:String,
        enum:['delevery', 'return'],
        required: [true, ERROR_MSG.REQUIRED("challenType")]
    },
    date: {
        type: Date,
        required: [true, ERROR_MSG.REQUIRED("Purchase date")]
    },
    
}, { timestamps:true });

const Sales = mongoose.model("Sales", saleSchema);

export default Sales;