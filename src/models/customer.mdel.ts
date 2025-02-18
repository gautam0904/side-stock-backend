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
    billingAddress: {
        type: String,
        required: false
    },
    sites: [{
        siteName: {
            type: String,
            required: false
        },
        siteAddress: {
            type: String,
            required: false
        },
        challanNumber:{
            type: String,
            required: true
        },
        prizefix: [{
            productName: {
                type: String,
                required: false
            },
            size: {
                type: String,
                required: false
            },
            rate: {
                type: Number,
                required: [true, ERROR_MSG.REQUIRED("Rate")]
            }
        }]
    }],
   

}, { timestamps: true });

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
