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
    billNumber: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Bill Number")] ,
    },
    invoiceNumber: {
        type: String,
        required:false ,
    },
    withGST:{
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: new Date(),
        required: [true, ERROR_MSG.REQUIRED("Date")] 
    },
    customerName: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Customer Name")]
    },
    mobileNumber: {
        type: String,
        required: false
    },
    siteName: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Site Name")]
    },
    totalPayment: {
        type: Number,
        required: [true, ERROR_MSG.REQUIRED("Total Payment")]
    },
    duePayment: {
        type: Number,
        required: [true, ERROR_MSG.REQUIRED("Due Payment")]
    },
    makePayment: {
        type: Number,
        required : false
    },
    paymentType:{
        type:String,
        enum:['Online', 'Cash'],
        required: [true, ERROR_MSG.REQUIRED("Payment Type")]
    },
    remark:{
        type: String,
        required: true
    }
}, { timestamps: true });

const Payments = mongoose.model("Payments", paymentSchema);

export default Payments;
