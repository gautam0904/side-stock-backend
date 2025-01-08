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
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: [true, ERROR_MSG.REQUIRED("Customer ID")]
    },
    siteName: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Site Name")]
    },
    siteAddress: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Site Address")]
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
        required: [true, ERROR_MSG.REQUIRED("Challan Number")]
    },
    transportCharges: {
        type: Number,
        required: [true, ERROR_MSG.REQUIRED("Transport Charges")]
    }
}, { timestamps:true });

const Sales = mongoose.model("Sales", saleSchema);

export default Sales;