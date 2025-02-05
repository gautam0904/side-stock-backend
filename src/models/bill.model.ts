import mongoose from "mongoose";
import { ERROR_MSG } from "../constants/message.js";

const billSchema = new mongoose.Schema({
    today: {
        type: Date,
        default: new Date()
    },
    challans: [{
        challanId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Challan'
        },
    }],
    billName: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Customer Name")]
    },
    mobileNumber: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Mobile Number")]
    },
    billNumber: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Bill Number")]
    },
    partnerName: {
        type: String,
        required: false
    },
    partnerMobileNumber: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        required: [true, ERROR_MSG.REQUIRED("Purchase date")]
    },
    billTo: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Bill To")]
    },
    reference: {
        type: String,
        required: false
    },
    referenceMobileNumber: {
        type: String,
        required: false
    },
    billAddress: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Bill Address")]
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
    products: [{
        productName: {
            type: String,
            required: [true, ERROR_MSG.REQUIRED("Product")]
        },
    }],
    monthData: [{
        year: {
            type: Number,
            require: [true, ERROR_MSG.REQUIRED("Year")]
        },
        month: {
            type: Number,
            require: [true, ERROR_MSG.REQUIRED("month")]
        },
        monthTotalAmount: {
            type: Number,
            require: [true, ERROR_MSG.REQUIRED("Total Amount")]
        },
        previousAmount:{
            type: Number,
            require: [true, ERROR_MSG.REQUIRED("Previous Amount")]
        },
        monthPayment:{
            type: Number,
            require: [true, ERROR_MSG.REQUIRED("Month Payment Amount")]
        },
        products: [{
            productName: {
                type: String,
                required: [true, ERROR_MSG.REQUIRED("Product")]
            },
            size: {
                type: String,
                required: false
            },
            quantity: {
                type: Number,
                required: false
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
                required: false
            },
            amount: {
                type: Number,
                required: [true, ERROR_MSG.REQUIRED("Product amount")]
            },
        }],
    }],

    serviceCharge: {
        type: Number,
        required: [true, ERROR_MSG.REQUIRED("Transport and casting")]
    },
    damageCharge: {
        type: Number,
        required: [true, ERROR_MSG.REQUIRED("Amount")]
    },
    totalPayment: {
        type: Number,
        required: [true, ERROR_MSG.REQUIRED("Total amount")]
    }
}, { timestamps: true });

const Bills = mongoose.model("Bills", billSchema);


export default Bills;