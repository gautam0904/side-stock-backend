import mongoose from "mongoose";
import { ERROR_MSG } from "../constants/message.js";

const customerSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Customer Name")]
    },
    mobileNumber: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Mobile Number")]
    },
    partnerName: {
        type: String,
        required: false
    },
    partnerMobileNumber: {
        type: String,
        required: false
    },
    reference: {
        type: String,
        required: false
    },
    referenceMobileNumber: {
        type: String,
        required: false
    },
    residentAddress: {
        type: String,
        required: false
    },
    aadharNo: {
        type: String,
        required: false
    },
    pancardNo: {
        type: String,
        required: false
    },
    aadharPhoto: {
        type: String,
        required: false
    },
    panCardPhoto: {
        type: String,
        required: false
    },
    customerPhoto: {
        type: String,
        required: false
    },
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
    billingAddress: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Billing Address")]
    },
    sites:[{
        siteName: {
            type: String,
            required: [true, ERROR_MSG.REQUIRED("Site Name")]
        },
        siteAddress: {
            type: String,
            required: [true, ERROR_MSG.REQUIRED("Site Address")]
        },
    }],
    prizefix:[{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Products",
            required: [true, ERROR_MSG.REQUIRED("Product ID")]
        },
        rate: {
            type: Number,
            required: [true, ERROR_MSG.REQUIRED("Rate")]
        }
    }]

}, { timestamps: true });

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
