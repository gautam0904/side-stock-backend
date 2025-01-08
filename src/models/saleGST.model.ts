import mongoose from "mongoose";
import { ERROR_MSG } from "../constants/message.js";

const saleGSTSchema = new mongoose.Schema({
    GSTnumber: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("GST number")]
    },
    invoiceNumber: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Bill number")]
    },
    date: {
        type: Date,
        required: [true, ERROR_MSG.REQUIRED("Purchase date")]
    },
    billTo: {
        type:String,
        required:[true, ERROR_MSG.REQUIRED("Bill To")]
    },
    mobileNumber: {
        type:String,
        required:[true,ERROR_MSG.REQUIRED("Mobile Number")]
    },
     billAddress: {
        type:String,
        required:[true, ERROR_MSG.REQUIRED("Bill Address")]
    },
    siteName: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Site name")]
    },
    siteAddress: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Site Address")]
    },
    pancard: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Pan Card")]
    },
    products:[{
        productName: {
            type: String,
            required: [true, ERROR_MSG.REQUIRED("Product name")]
        },
        size: {
            type: Number,
            required: [true, ERROR_MSG.REQUIRED("Product Size")]
        },
        quantity: {
            type: Number,
            required: [true, ERROR_MSG.REQUIRED("Product quantity")]
        },
        rate: {
            type: Number,
            required: [true, ERROR_MSG.REQUIRED("Product rate")]
        },
        startingDate: {
        type: Date,
        required: [true, ERROR_MSG.REQUIRED("Starting date")]
        },
        endingDate: {
        type: Date,
        required: [true, ERROR_MSG.REQUIRED("Emding date")]
        },
        amount: {
            type: Number,
            required: [true, ERROR_MSG.REQUIRED("Product amount")]
        }
    }],
    transportAndCasting: {
        type: Number,
        required: [true, ERROR_MSG.REQUIRED("Transport and casting")]
    },
    amount: {
        type: Number,
        required: [true, ERROR_MSG.REQUIRED("Amount")]
    },
    sgst: {
        type: Number,
        required: false
    },
    cgst: {
        type: Number,
        required: false
    },
    igst: {
        type: Number,
        required: false
    },
    totalAmount: {
        type: Number,
        required: [true, ERROR_MSG.REQUIRED("Total amount")]
    }
}, { timestamps:true });

const SalesGST = mongoose.model("SalesGST", saleGSTSchema);

export default SalesGST;