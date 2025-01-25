import { ERROR_MSG, MSG } from "../constants/message.js";
import { statuscode } from "../constants/status.js";
import { ApiError } from "../utils/apiError.js";
import { IBill } from "../dto/req.dto.js";
import Bill from "../models/bill.model.js"
import { PipelineStage } from "mongoose";
import { PaymentService } from "./payment.service.js";
import Challan from "../models/challan.model.js";

interface PaginatedResponse {
    statuscode: number;
    message: string;
    data: {
        bill: any;
        pagination: {
            total: number;
        };
        metadata: any;
    }
}

export class BillService {
    async createBill(bill: IBill) {
        const [existingBill] = await Bill.aggregate([{
            $match: {
                billTo: bill.billTo,
                mobileNumber: bill.mobileNumber
            }
        }]);

        if (existingBill) {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.EXISTS('Bill'));
        }

        bill.products = bill.products.map((p) => {
            return {
                productName: p.productName,
                quantity: p.quantity,
                rate: p.rate,
                startingDate: p.startingDate,
                endingDate: p.endingDate,
                amount: p.amount
            }
        })

        const result = await Bill.create({
            customerName: bill.customerName,
            mobileNumber: bill.mobileNumber,
            partnerName: bill.partnerName,
            partnerMobileNumber: bill.partnerMobileNumber,
            date: bill.date,
            billTo: bill.billTo,
            reference: bill.reference,
            referenceMobileNumber: bill.referenceMobileNumber,
            billAddress: bill.billAddress,
            siteName: bill.siteName,
            siteAddress: bill.siteAddress,
            pancard: bill.pancard,
            products: bill.products,
            serviceCharge: bill.serviceCharge,
            damageCharge: bill.damageCharge,
            totalPayment: bill.totalPayment,
            billNumber: bill.billNumber
        });

        return {
            statuscode: statuscode.CREATED,
            message: MSG.SUCCESS('Bill creation'),
            data: result
        };
    }

    async getBill(options: any): Promise<PaginatedResponse> {
        const {
            sortBy = 'createdAt',
            sortOrder = 'desc',
            customerName = '',
            siteName = '',
            givenStartDate = null,
            givenEndDate = null
        } = options;
    
        // Step 1: Initialize pipeline for Bill aggregation
        const pipeline: PipelineStage[] = [
            {
                $match: {
                    $and: [
                        { customerName: { $regex: customerName.toString(), $options: 'i' } },
                        { siteName: { $regex: siteName.toString(), $options: 'i' } },
                    ]
                }
            },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
                        {
                            $project: {
                                _id: 1,
                                customerName: 1,
                                mobileNumber: 1,
                                partnerName: 1,
                                partnerMobileNumber: 1,
                                date: 1,
                                billTo: 1,
                                reference: 1,
                                referenceMobileNumber: 1,
                                billAddress: 1,
                                siteName: 1,
                                siteAddress: 1,
                                pancard: 1,
                                products: 1,
                                serviceCharge: 1,
                                damageCharge: 1,
                                totalPayment: 1,
                                billNumber: 1,
                            }
                        }
                    ]
                }
            }
        ];
    
        const [result] = await Bill.aggregate(pipeline);
        const total = result.metadata[0]?.total || 0;
    
        // Step 2: Fetch payment data for each invoice
        let paymentDataMap: any = [];
        if (result.data[0].billNumber) {
            const p = new PaymentService();
            paymentDataMap = await p.getPaymentForBill(result.data[0].billNumber);
            paymentDataMap = paymentDataMap.data.payments;
        }
    
        // Step 3: Calculate month-wise data, day count, and track previous due payments
        let previousRestBill = 0; // Initialize the previous rest bill to track remaining payments
        const monthWiseData = result.data.map((bill: IBill) => {
            const today = new Date();
            let monthlyProducts: any = [];
    
            bill.products.forEach((product) => {
                const startDate = givenStartDate ? givenStartDate : new Date(product.startingDate);
                const endDate = givenEndDate ? givenEndDate : (product.endingDate ? new Date(product.endingDate) : today);
    
                const monthWiseAmounts = this.calculateMonthlyAmounts(startDate, endDate, product.rate, product.quantity);
    
                monthWiseAmounts.forEach((monthData) => {
                    const firstDayOfMonth = new Date(monthData.year, monthData.month - 1, 1); 
                    const lastDayOfMonth = new Date(monthData.year, monthData.month, 0); 
                    let productStartDate = firstDayOfMonth;
                    let productEndDate = lastDayOfMonth;
    
                    if (monthData.month === today.getMonth() + 1 && monthData.year === today.getFullYear()) {
                        productEndDate = today;
                    }
    
                    productStartDate = productStartDate < new Date(product.startingDate) ? new Date(product.startingDate) : productStartDate;
                    productEndDate = productEndDate > new Date(product.endingDate) ? new Date(product.endingDate) : productEndDate;
    
                    const dayCount = Math.max(0, (productEndDate.getTime() - productStartDate.getTime()) / (1000 * 3600 * 24) + 1);
    
                    let totalPaid = 0;
                    paymentDataMap.forEach((payment: any) => {
                        const nextFirstDate: any = new Date(Number(monthData.year), Number(monthData.month), 1);
                        if (new Date(payment.date) <= new Date(nextFirstDate - 1)) {
                            totalPaid += payment.makePayment || 0;
                        }
                    });
    
                    previousRestBill += monthData.amount;
                    const remainingDue = previousRestBill - totalPaid;
    
                    monthlyProducts.push({
                        productName: product.productName,
                        quantity: product.quantity,
                        rate: product.rate,
                        amount: monthData.amount,
                        month: monthData.month,
                        year: monthData.year,
                        previousRestBill: remainingDue > 0 ? remainingDue : 0,
                        startingDate: productStartDate,
                        endingDate: productEndDate,
                        dayCount: dayCount 
                    });
                });
            });
    
            return monthlyProducts;
        }).flat(); 
    
        // Step 4: Group by year and month and sum the amounts
        const groupedData = monthWiseData.reduce((acc: any, data: any) => {
            const key = `${data.year}-${data.month}`;
            if (!acc[key]) {
                acc[key] = {
                    year: data.year,
                    month: data.month,
                    totalAmount: 0,
                    products: []
                };
            }
            acc[key].totalAmount += data.amount;
            acc[key].products.push(data);
    
            return acc;
        }, {});
    
        const aggregatedData = Object.values(groupedData);
    
        // Step 5: Return the response
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Bill retrieved'),
            data: {
                bill: aggregatedData,
                pagination: { total },
                metadata: {
                    lastUpdated: new Date(),
                    sortField: sortBy,
                    sortDirection: sortOrder
                }
            }
        };
    }
    
    

    // Helper function to calculate monthly amounts for a product
    private calculateMonthlyAmounts(startDate: Date, endDate: Date, rate: Number, quantity: Number) {
        const monthWiseAmounts = [];

        let currentMonth = new Date(startDate);
        let currentYear = currentMonth.getFullYear();
        let currentMonthIndex = currentMonth.getMonth();

        while (currentMonth <= endDate) {
            const monthStartDate = new Date(currentYear, currentMonthIndex, 1);
            const nextMonthStartDate: any = new Date(currentYear, currentMonthIndex + 1, 1);
            const monthEndDate = nextMonthStartDate > endDate ? endDate : new Date(nextMonthStartDate - 1); // End of the current month or the end date

            const daysInMonth = Math.max(0, (monthEndDate.getTime() - monthStartDate.getTime()) / (1000 * 3600 * 24) + 1);

            const amount = Number(rate) * Number(quantity) * daysInMonth;

            monthWiseAmounts.push({
                month: currentMonthIndex + 1, 
                year: currentYear,
                amount: amount
            });

            currentMonthIndex++;
            if (currentMonthIndex > 11) {
                currentMonthIndex = 0;
                currentYear++;
            }
            currentMonth = new Date(currentYear, currentMonthIndex, 1);
        }

        return monthWiseAmounts;
    }


    async updateBills(products: IBill) {

        const result = await Bill.findByIdAndUpdate(products._id, products, { new: true });
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Bill updated'),
            data: result
        };
    }

    async deleteBill(productId: string) {
        const result = await Bill.findByIdAndDelete(productId);
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Bill deleted'),
            data: result
        };
    }
}