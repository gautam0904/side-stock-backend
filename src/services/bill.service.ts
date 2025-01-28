import { ERROR_MSG, MSG } from "../constants/message.js";
import { statuscode } from "../constants/status.js";
import { ApiError } from "../utils/apiError.js";
import { IBill } from "../interfaces/bill.interface.js";
import Bill from "../models/bill.model.js"
import mongoose, { PipelineStage } from "mongoose";
import { PaymentService } from "./payment.service.js";
import Challan from "../models/challan.model.js";

interface PaginatedResponse {
    statuscode: number;
    message: string;
    data: {
        billData:any;
        bill: any;
        pagination: {
            total: number;
        };
        metadata: any;
    }
}

export class BillService {
    async createBill(bill: IBill) {

        const aggregationPipeline = [
            {
                '$facet': {
                    'returnChallans': [
                        {
                            '$match': {
                                '_id': {
                                    '$in': bill.challans.map((c) => (new mongoose.Schema.Types.ObjectId(c.challanId.toString())))
                                },
                                'challenType': 'Return'
                            }
                        }, {
                            '$lookup': {
                                'from': 'customers',
                                'localField': 'customerId',
                                'foreignField': '_id',
                                'as': 'customerDetails'
                            }
                        }, {
                            '$unwind': '$customerDetails'
                        }
                    ],
                    'anyChallan': [
                        {
                            '$match': {
                                '_id': {
                                    '$in': bill.challans.map((c) => (new mongoose.Schema.Types.ObjectId(c.challanId.toString())))
                                }
                            }
                        }, {
                            '$lookup': {
                                'from': 'customers',
                                'localField': 'customerId',
                                'foreignField': '_id',
                                'as': 'customerDetails'
                            }
                        }, {
                            '$unwind': '$customerDetails'
                        },
                    ]
                }
            }, {
                '$project': {
                    'challan': {
                        '$cond': {
                            'if': {
                                '$gt': [
                                    {
                                        '$size': '$returnChallans'
                                    }, 0
                                ]
                            },
                            'then': '$returnChallans',
                            'else': {
                                '$arrayElemAt': [
                                    '$anyChallan', 0
                                ]
                            }
                        }
                    }
                }
            }, {
                '$replaceRoot': {
                    'newRoot': {
                        'results': '$result'
                    }
                }
            }
        ]
        const challanDetail = await Challan.aggregate(aggregationPipeline)
        let returnChallan = Array.isArray(challanDetail[0].challan) ? challanDetail[0].challan : [];

        if (returnChallan.length > 0) {

            const totals = returnChallan.reduce((acc : any, item: any) => {
                acc.serviceCharge += item.serviceCharge || 0; 
                acc.damageCharge += item.damageCharge || 0;  
                return acc;
            }, { serviceCharge: 0, damageCharge: 0 });

            bill.serviceCharge = totals.serviceCharge;
            bill.damageCharge = totals.damageCharge;
        }

        const result = await Bill.create({
            customerName: challanDetail[0].customerDetails.customerName,
            mobileNumber: challanDetail[0].customerDetails.mobileNumber,
            challans: bill.challans,
            billNumber:1,
            partnerName: challanDetail[0].customerDetails.partnerName || '',
            partnerMobileNumber: challanDetail[0].customerDetails.partnerMobileNumber || '',
            date: bill.date,
            billTo: challanDetail[0].customerDetails.customerName,
            reference: challanDetail[0].customerDetails.reference,
            referenceMobileNumber: challanDetail[0].customerDetails.referenceMobileNumber,
            products: bill.products,
            billAddress: challanDetail[0].customerDetails.billingAddress,
            siteName: challanDetail[0].siteName,
            siteAddress: challanDetail[0].siteAddress,
            pancard: challanDetail[0].customerDetails.pancard,
            monthData: bill.monthData,
            serviceCharge: bill.serviceCharge || 0,
            damageCharge: bill.damageCharge || 0,
            totalPayment: bill.totalPayment,
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

        if (customerName == '' || siteName == '') {
            throw new ApiError(statuscode.BADREQUEST, 'Some Field is missing............')
        }

        // Step 1: Initialize pipeline for Bill aggregation
        const pipeline: PipelineStage[] = [
            {
                $match: {
                    $and: [
                        { billName: { $regex: customerName.toString(), $options: 'i' } },
                        { siteName: { $regex: siteName.toString(), $options: 'i' } },
                    ]
                }
            },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
                    ]
                }
            }
        ];

        const [result] = await Bill.aggregate(pipeline);
        const total = result.metadata[0]?.total || 0;

        // Step 2: Fetch payment data for each invoice
        let paymentDataMap: any = [];
        if (result?.data[0]?.billNumber) {
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
                const startDate = givenStartDate ? new Date(givenStartDate) : new Date(product.startingDate);
                const endDate = givenEndDate ? new Date(givenEndDate) : (product.endingDate ? new Date(product.endingDate) : today);

                const monthWiseAmounts = this.calculateMonthlyAmounts(startDate, endDate, product.startingDate, product.endingDate, product.rate, product.quantity);

                monthWiseAmounts.forEach((monthData) => {
                    const firstDayOfMonth = new Date(monthData.year, monthData.month - 1, 1);
                    const lastDayOfMonth = new Date(monthData.year, monthData.month, 0);
                    let productStartDate = firstDayOfMonth;
                    let productEndDate = lastDayOfMonth;

                    if (startDate > firstDayOfMonth ) {
                        productStartDate = startDate
                    }
                    
                    if (endDate < lastDayOfMonth) {
                        productEndDate = endDate
                    }

                    if (monthData.month === today.getMonth() + 1 && monthData.year === today.getFullYear()) {
                        productEndDate = today;
                    }

                    productStartDate = productStartDate < new Date(product.startingDate) ? new Date(product.startingDate) : productStartDate;
                    if (product.endingDate) {
                        productEndDate = productEndDate > new Date(product.endingDate) ? new Date(product.endingDate) : productEndDate;
                    }

                    const dayCount = parseInt((Math.max(0, (productEndDate.getTime() - productStartDate.getTime()) / (1000 * 3600 * 24) + 1)).toString());

                    let totalPaid = 0;
                    paymentDataMap.forEach((payment: any) => {
                        if (new Date(payment.date) <= new Date(productEndDate) && new Date(payment.date) >= new Date(productStartDate)) {
                            totalPaid += payment.makePayment || 0;
                        }
                    });

                    previousRestBill += monthData.amount;
                    const remainingDue = previousRestBill - totalPaid;

                    monthlyProducts.push({
                        productName: product.productName,
                        quantity: product.quantity,
                        size: product.size,
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

        const finalTotal = aggregatedData.reduce((acc: any, data: any) => {
            acc.totalAmount += data.totalAmount;
            return acc;
        }, {});

        const billData : any = result.data[0] ?? {};
        billData.totalPayment = finalTotal

        // Step 5: Return the response
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Bill retrieved'),
            data: {
                billData,
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
    private calculateMonthlyAmounts(startDate: Date, endDate: Date, productStartDate: Date, productEndDate: Date | null, rate: Number, quantity: Number) {
        const monthWiseAmounts = [];

        let currentMonth = new Date(startDate);
        let currentYear = currentMonth.getFullYear();
        let currentMonthIndex = currentMonth.getMonth();

        while (currentMonth <= new Date(endDate)) {
            let monthStartDate = new Date(currentYear, currentMonthIndex, 1);
            let nextMonthStartDate: any = new Date(currentYear, currentMonthIndex + 1, 1);
            let monthEndDate = nextMonthStartDate > endDate ? endDate : new Date(nextMonthStartDate - 1); // End of the current month or the end date
            productStartDate = new Date(productStartDate);
            productEndDate = productEndDate == null ? new Date() : new Date(productEndDate);
            
            if (productStartDate > productEndDate  || startDate > endDate) {
                throw new ApiError(statuscode.BADREQUEST , 'Date range is Wrong')
            }
            if (startDate > monthStartDate ) {
                monthStartDate = startDate
            }
            
            if (endDate < monthEndDate) {
                monthEndDate = endDate
            }
            if ((monthStartDate >= productStartDate ) && (productEndDate >= monthEndDate)) {
                
                const daysInMonth = parseInt((Math.max(0, (monthEndDate.getTime() - monthStartDate.getTime()) / (1000 * 3600 * 24) + 1)).toString());
                const amount = Number(rate) * Number(quantity) * daysInMonth;
                monthWiseAmounts.push({
                    month: currentMonthIndex + 1,
                    year: currentYear,
                    amount: amount
                });
            }else if ((productStartDate > monthStartDate) && (productEndDate >= monthEndDate)) {
                const daysInMonth = parseInt((Math.max(0, (monthEndDate.getTime() - productStartDate.getTime()) / (1000 * 3600 * 24) + 1)).toString());
                const amount = Number(rate) * Number(quantity) * daysInMonth;
                monthWiseAmounts.push({
                    month: currentMonthIndex + 1,
                    year: currentYear,
                    amount: amount
                });
            }else if ((productStartDate > monthStartDate) && (productEndDate < monthEndDate)) {
                const daysInMonth = parseInt((Math.max(0, (productEndDate.getTime() - productStartDate.getTime()) / (1000 * 3600 * 24) + 1)).toString());
                const amount = Number(rate) * Number(quantity) * daysInMonth;
                monthWiseAmounts.push({
                    month: currentMonthIndex + 1,
                    year: currentYear,
                    amount: amount
                });
            }else if ((monthStartDate >= productStartDate ) &&  (productEndDate < monthEndDate)) {
                const daysInMonth = parseInt((Math.max(0, (productEndDate.getTime() - monthStartDate.getTime()) / (1000 * 3600 * 24) + 1)).toString());
                const amount = Number(rate) * Number(quantity) * daysInMonth;
                monthWiseAmounts.push({
                    month: currentMonthIndex + 1,
                    year: currentYear,
                    amount: amount
                });
            }




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