import { ERROR_MSG, MSG } from "../constants/message.js";
import { statuscode } from "../constants/status.js";
import { ApiError } from "../utils/apiError.js";
import { IChallan } from "../dto/req.dto.js";
import Challan from "../models/challan.model.js"
import { PaginatedResponse } from "../interfaces/product.interface.js";
import { QueryOptions } from "../interfaces/customerGST.interface.js";
import mongoose, { PipelineStage } from "mongoose";
import Bills from "../models/bill.model.js";
import { IBill } from "../interfaces/bill.interface.js";
import { CustomerService } from "./customer.service.js";
import { ICustomer } from "../interfaces/nonGSTmodels.interface.js";
import { BillService } from "./bill.service.js";

const customerService = new CustomerService();
const billService = new BillService();
export class ChallanService {
    async createChallan(challan: IChallan) {
        if (await this.challanExists(challan.challanNumber)) {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.EXISTS('Challan'));
        }

        challan.products = this.formatProducts(challan.products);

        const newChallan = await this.saveChallan(challan);

        let customer: any = await customerService.getCustomerById(challan.customerId);

        customer = customer.data;
        
        const cI = customer.sites.findIndex((s: any) => s.siteName === challan.siteName);

        if (cI !== -1) {
            customer.sites[cI].challanNumber = newChallan.challanNumber;

            const updatedCustomer = await customerService.updateCustomer({
                _id: customer._id,
                sites: customer.sites,
            } as ICustomer);

            await this.processBilling(challan, newChallan);
        }

        return {
            statuscode: statuscode.CREATED,
            message: MSG.SUCCESS('Challan creation'),
            data: newChallan,
        };
    }


    async challanExists(challanNmber: string) {
        const challan = await Challan.aggregate([{ $match: { challanNmber } }]);
        return challan.length > 0;
    }

    formatProducts(products: any) {
        return products.map(({ date, productName, size, quantity, rate, amount }: any) => ({
            date,
            productName,
            size,
            quantity,
            rate,
            amount
        }));
    }

    async saveChallan(challan: IChallan) {
        return Challan.create({
            ...challan,
            challenType: challan.type,
            products: challan.products
        });
    }

    async processBilling(challan: IChallan, newChallan: any) {
        const challanNumber = challan.challanNumber.split('C')[1];
        const existingBill = await Bills.findOne({
            customerId: challan.customerId,
            siteName: challan.siteName
        });

        challanNumber == '1' ? await billService.createBillBychallan(newChallan) : await this.updateExistingBill(existingBill, existingBill?.products);
    }

    generateBillProducts(products: any, d: any) {
        const today = new Date();
        return products.map(({ productName = '', size = '', quantity = 0, rate = 0, amount = 0, date = today }) => {
            const startDate = new Date(date) || today;
            return {
                productName,
                size,
                quantity,
                rate,
                amount,
                month: startDate.getMonth(),
                year: startDate.getFullYear(),
                previousRestBill: 0,
                startingDate: startDate,
                endingDate: null,
                dayCount: Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1
            };
        });
    }

    calculateTotal(products: any) {
        return products.reduce((total: any, { amount, dayCount }: any) => total + amount * dayCount, 0);
    }

    async updateExistingBill(bill: any, products: any) {
        await Bills.findByIdAndUpdate(bill._id, {
            $push: { products }
        });
    }

    getMonthlyData(products: any) {
        let previousRestBill = 0;
        return products.flatMap((product: any) => {
            const monthWiseAmounts = this.getMonthlyAmounts(
                product.startingDate,
                new Date(),
                product.rate,
                product.quantity
            );

            return monthWiseAmounts.map(({ month, year, amount }) => {
                previousRestBill += amount;
                return {
                    ...product,
                    month,
                    year,
                    previousRestBill: Math.max(previousRestBill, 0)
                };
            });
        });
    }

    getMonthlyAmounts(startDate: any, endDate: any, rate: number, quantity: number) {
        const monthlyAmounts = [];
        let current = new Date(startDate);

        while (current <= endDate) {
            const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
            const nextMonthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
            const monthEnd = nextMonthStart > endDate
                ? endDate
                : new Date(nextMonthStart.getTime() - 1);

            const days = Math.ceil((monthEnd.getTime() - monthStart.getTime()) / (1000 * 3600 * 24)) + 1;
            const amount = rate * quantity * days;

            monthlyAmounts.push({
                month: monthStart.getMonth() + 1,
                year: monthStart.getFullYear(),
                amount
            });

            current = nextMonthStart;
        }

        return monthlyAmounts;
    }

    async getChallan(options: QueryOptions): Promise<PaginatedResponse> {
        const {
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search = ''
        } = options;

        const pipeline: PipelineStage[] = [
            search ? {
                $match: {
                    $or: [
                        { custonerName: { $regex: search, $options: 'i' } },
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
                                challanNumber: 1,
                                challenType: 1,
                                date: 1,
                                customerName: 1,
                                mobileNumber: 1,
                                siteName: 1,
                                siteAddress: 1,
                                products: 1,
                                loading: 1,
                                unloading: 1,
                                transportCharge: 1,
                                amount: 1,
                                totalAmount: 1,
                                customerId: 1,
                                serviceCharge: 1,
                                damageCharge: 1,
                            }
                        }
                    ]
                }
            }
        ].filter(Boolean) as PipelineStage[];

        const [result] = await Challan.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;

        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Challan retrieved'),
            data: {
                products: result.data,
                pagination: {
                    total,
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


    async updateChallans(products: IChallan) {

        const result = await Challan.findByIdAndUpdate(products._id, products, { new: true });
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Challan updated'),
            data: result
        };
    }

    async deleteChallan(productId: string) {
        const result = await Challan.findByIdAndDelete(productId);
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Challan deleted'),
            data: result
        };
    }
}