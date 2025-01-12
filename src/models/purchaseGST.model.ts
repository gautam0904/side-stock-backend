import mongoose from "mongoose";
import { ERROR_MSG } from "../constants/message.js";

const purchaseGSTSchema = new mongoose.Schema({
    GSTnumber: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("GST number")]
    },
    billNumber: {
        type: String,
        unique: true,
        required: [true, ERROR_MSG.REQUIRED("Bill number")]
    },
    date: {
        type: Date,
        required: [true, ERROR_MSG.REQUIRED("Purchase date")]
    },
    companyName: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Company name")]
    },
    supplierName: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Supplier name")]
    },
    supplierNumber: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Supplier number")]
    },
    products:[{
        productName: {
            type: String,
            required: [true, ERROR_MSG.REQUIRED("Product name")]
        },
        quantity: {
            type: Number,
            required: [true, ERROR_MSG.REQUIRED("Product quantity")]
        },
        rate: {
            type: Number,
            required: [true, ERROR_MSG.REQUIRED("Product rate")]
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

const PurchaseGST = mongoose.model("PurchaseGST", purchaseGSTSchema);

export default PurchaseGST;