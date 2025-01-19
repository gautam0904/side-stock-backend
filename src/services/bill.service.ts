import { ERROR_MSG, MSG } from "../constants/message.js";
import { statuscode } from "../constants/status.js";
import { ApiError } from "../utils/apiError.js";
import { IBill } from "../dto/req.dto.js";
import Bill from "../models/bill.model.js"
import { QueryOptions } from "../interfaces/customerGST.interface.js";
import { PipelineStage } from "mongoose";

 interface PaginatedResponse {
    statuscode: number;
    message: string;
    data: {
        products: any;
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
            quantity: bill.quantity,
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
            totalPayment: bill.totalPayment
        });

        return {
            statuscode: statuscode.CREATED,
            message: MSG.SUCCESS('Bill creation'),
            data: result
        };
    }
    async getBill(options: QueryOptions): Promise<PaginatedResponse> {
        const {
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search = ''
        } = options;

        const pipeline: PipelineStage[] = [
            search ? {
                $match: {
                    $or: [
                        { customerName: { $regex: search, $options: 'i' } },
                        { size: { $regex: search, $options: 'i' } },
                    ]
                }
            } : { $match: {} },

            {
                $facet: {
                    metadata: [
                        { $count: 'total' }
                    ],
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
                                totalPayment: 1
                            }
                        }
                    ]
                }
            }
        ].filter(Boolean) as PipelineStage[];

        const [result] = await Bill.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;

        // Calculate month-wise data with per-day rate * quantity for each month the product spans
        const monthWiseData = result.data.map((bill) => {
            // Define today date if endingDate is missing
            const today = new Date();
            return bill.products.map((product) => {
                const startDate = new Date(product.startingDate);
                const endDate = product.endingDate ? new Date(product.endingDate) : today;

                const monthWiseAmounts = this.calculateMonthlyAmounts(startDate, endDate, product.rate, product.quantity);

                // Add product details along with monthly calculated amounts
                return monthWiseAmounts.map((monthData) => ({
                    productName: product.productName,
                    quantity: product.quantity,
                    rate: product.rate,
                    amount: monthData.amount,
                    month: monthData.month,
                    year: monthData.year,
                }));
            });
        }).flat(); // Flatten the array of products

        // Group by year and month and sum the amounts
        const groupedData = monthWiseData.reduce((acc, data) => {
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

        // Convert the grouped data to an array
        const aggregatedData = Object.values(groupedData);

        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Bill retrieved'),
            data: {
                products: aggregatedData,
                pagination: {
                    total
                },
                metadata: {
                    lastUpdated: new Date(),
                    filterApplied: !!search,
                    sortField: sortBy,
                    sortDirection: sortOrder
                }
            }
        };
    }

    // Helper function to calculate monthly amounts for a product
    private calculateMonthlyAmounts(startDate: Date, endDate: Date, rate: number, quantity: number) {
        const monthWiseAmounts = [];

        let currentMonth = new Date(startDate);
        let currentYear = currentMonth.getFullYear();
        let currentMonthIndex = currentMonth.getMonth();

        // Loop over months between start and end date
        while (currentMonth <= endDate) {
            const monthStartDate = new Date(currentYear, currentMonthIndex, 1);
            const nextMonthStartDate = new Date(currentYear, currentMonthIndex + 1, 1);
            const monthEndDate = nextMonthStartDate > endDate ? endDate : new Date(nextMonthStartDate - 1); // End of the current month or the end date

            // Calculate the number of days this product is active in the current month
            const daysInMonth = Math.max(0, (monthEndDate.getTime() - monthStartDate.getTime()) / (1000 * 3600 * 24) + 1);

            // Calculate the amount for this month
            const amount = rate * quantity * daysInMonth;

            // Add month and amount to result
            monthWiseAmounts.push({
                month: currentMonthIndex + 1, // Month is 1-based
                year: currentYear,
                amount: amount
            });

            // Move to the next month
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