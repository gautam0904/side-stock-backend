import mongoose from "mongoose";
import { ERROR_MSG } from "../constants/message.js";

const paymentSchema = new mongoose.Schema({
    GSTnumber: {
        type: String,
        required: false
    },
    panCardNumber: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        required: false
    },
    billTo: {
        type: String,
        required: false
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

const Payments = mongoose.model("Payments", paymentSchema);

export default Payments;
