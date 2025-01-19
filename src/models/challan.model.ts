import mongoose from "mongoose";
import { ERROR_MSG } from "../constants/message.js";

const saleSchema = new mongoose.Schema({
    challenType: {
        type:String,
        enum:['Delivery', 'Return'],
        required: [true, ERROR_MSG.REQUIRED("challenType")]
    },
    date: {
        type: Date,
        required: false
    },
    customerName: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Customer Name")]
    },
    siteName: {
        type: String,
        required: false
    },
    siteAddress: {
        type: String,
        required: false
    },
    loading: {
        type: Number,
        default: 0
    },
    unloading: {
        type: Number,
        default: 0
    },
    challanNumber: {
        type: String,
        required:false
    },
    mobileNumber: {
        type: String,
        required:false
    },
    transportCharges: {
        type: Number,
        required:false
    },
    amount: {
        type: Number,
        required:false
    },
    totalAmount: {
        type: Number,
        required:false
    },
    products : [{
        date: {
            type: Date,
            required: false
        },
        productName:{
            type: String,
            required:false
        },
        size: {
            type: String,
            required:false
        },
        quantity:{
            type: Number,
            required:false
        },
        rate:{
            type: Number,
            required:false
        },
        amount: {
            type: Number,
            required:false
        },
    }]
}, { timestamps:true });

const Challan = mongoose.model("Sales", saleSchema);

export default Challan;