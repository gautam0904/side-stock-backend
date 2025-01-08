import mongoose from "mongoose";
import { ERROR_MSG } from "../constants/message.js";

const customerGSTSchema = new mongoose.Schema({
    GSTnumber: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("GST number")]
    },
    panCardNumber: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("PAN Card number")]
    },
    date: {
        type: Date,
        required: [true, ERROR_MSG.REQUIRED("Date")] 
    },
    billTo: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Bill To")]
    },
    customerName: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Customer Name")]
    },
    mobileNumber: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Mobile Number")]
    },
    siteName: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Site Name")]
    },
    siteAddress: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Site Address")]
    },
    billingAddress: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Billing Address")]
    }
}, { timestamps: true });

const CustomerGST = mongoose.model("CustomerGST", customerGSTSchema);

export default CustomerGST;
