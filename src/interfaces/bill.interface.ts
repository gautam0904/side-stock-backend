import { IChallan } from "../dto/req.dto.js";

interface Product {
    productName: string;
    quantity: number;
    rate: number;
    size: string;
    amount?: number;
    month?: number;
    year?: number;
    previousRestBill?: number;
    startingDate: Date;
    endingDate: Date | null;
    dayCount?: number;
}

interface MonthlyData {
    year: number;
    month: number;
    totalAmount: number;
    products: Product[];
}


export interface IBill {
    _id?: string;
    challans: IChallan[];
    customerName: string;
    mobileNumber: string;
    billNumber: Number;
    partnerName: string;
    partnerMobileNumber: string;
    billTo: string;
    date: Date,
    reference: string;
    referenceMobileNumber: string;
    billAddress: string;
    siteName: string;
    siteAddress: string;
    products: Product[];
    pancard: string;
    monthData: MonthlyData[],
    serviceCharge: Number;
    damageCharge: Number;
    totalPayment: Number;
    [key: string]: any;
}