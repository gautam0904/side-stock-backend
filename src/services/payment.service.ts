import { ERROR_MSG, MSG } from "../constants/message.js";
import { statuscode } from "../constants/status.js";
import { IPayment, PaginatedResponse, QueryOptions } from '../interfaces/payment.interface.js';
import Payments from "../models/payment.model.js";
import { ApiError } from "../utils/apiError.js";
import { PipelineStage } from 'mongoose';
import { SaleService } from "./saleGST.service.js";
import { IProduct } from "../interfaces/product.interface.js";

export class PaymentService {

    async createPayment(paymentData: IPayment) {
       

       

        const result = await Payments.create({
            GSTnumber: paymentData.GSTnumber,
            invoiceNumber: paymentData.invoiceNumber,
            siteName: paymentData.siteName,
            customerName: paymentData.customerName,
            mobileNumber: paymentData.mobileNumber,
            totalPayment: paymentData.totalPayment,
            duePayment: paymentData.duePayment,
            date: paymentData.date,
            makePayment: paymentData.makePayment,
            paymentType: paymentData.paymentType,
            panCardNumber: paymentData.panCardNumber,
            remark: paymentData.remark,
            billNumber: paymentData.billNumber 
        });

        if (result && paymentData.withGST) {
            const s = new SaleService();
            const sale = await s.createSale({
                GSTnumber: paymentData.GSTnumber || '',
                invoiceNumber: paymentData.invoiceNumber || "",
                date: paymentData.date,
                billTo: paymentData.customerName,
                mobileNumber: paymentData.mobileNumber || "",
                siteName: paymentData.siteName as string,
                billAddress: paymentData.billAddress || '' ,
                siteAddress: paymentData.siteAddress || '',
                pancard: paymentData.panCardNumber as string,
                products: paymentData.products as [{
                    productName: string;
                    size: Number;
                    quantity: Number;
                    rate: Number;
                    startingDate: Date;
                    endingDate: Date;
                    amount: Number;
                }],
                transportAndCasting: Number(paymentData.transportAndCasting) || 0,
                amount: Number(paymentData.makePayment) ,
                sgst: Number(paymentData.sgst),
                cgst: Number(paymentData.cgst),
                igst: Number(paymentData.igst),
                totalAmount: Number(paymentData.totalAmount),
            });
        }

        return {
            statuscode: statuscode.CREATED,
            message: MSG.SUCCESS('Payment creation'),
            data: result
        };
    }

    async getPayment(options: QueryOptions): Promise<PaginatedResponse> {
        const {
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search = ''
        } = options;

        const pipeline: PipelineStage[] = [
            search ? {
                $match: {
                    $or: [
                        { GSTnumber: { $regex: search, $options: 'i' } },
                        { invceNumber: { $regex: search, $options: 'i' } },
                        { customerName: { $regex: search, $options: 'i' } },
                        { mobileNumber: { $regex: search, $options: 'i' } },
                        { customerName: { $regex: search, $options: 'i' } },
                        { siteName: { $regex: search, $options: 'i' } },
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
                                GSTnumber: 1,

                            }
                        }
                    ]
                }
            }
        ].filter(Boolean) as PipelineStage[];

        const [result] = await Payments.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;

        return {
            statuscode: statuscode.OK,
            message: "Payments retrieved successfully",
            data: {
                payments: result.data,
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
    async getPaymentForBill(billNumber: any): Promise<PaginatedResponse> {

        if (!billNumber) {
            throw new ApiError(statuscode.BADREQUEST , ERROR_MSG.REQUIRED('Bill number'))
        }

        const pipeline: PipelineStage[] = [
            {
                $match: {
                    billNumber: { $regex: billNumber.toString(), $options: 'i' },
                },
            },
            {
                $facet: {
                    metadata: [
                        { $count: 'total' }
                    ],
                    data: [
                       
                        {
                            $project: {
                                _id: 1,
                                GSTnumber: 1,
                                withGST:1,
                                date:1,
                                makePayment:1,
                                billNumer:1,
                            }
                        }
                    ]
                }
            }
        ].filter(Boolean) as PipelineStage[];

        const [result] = await Payments.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;

        return {
            statuscode: statuscode.OK,
            message: "Payments retrieved successfully",
            data: {
                payments: result.data,
                pagination: {
                    total,
                },
                metadata: {
                    lastUpdated: new Date(),
                }
            }
        };
    }

    async getPaymentByName(options: QueryOptions) {
        const {
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search = ''
        } = options;

        const pipeline: PipelineStage[] = [
            search ? {
                $match: {
                    $or: [
                        {
                            customerName: {
                                $regex: search, $options:
                                    'i'
                            }
                        }
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
                    ]
                }
            }
        ].filter(Boolean) as PipelineStage[];

        const [result] = await Payments.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;

        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS("Payment retrieved"),
            data: {
                paymentBills: result.data,
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

    async updatePayment(paymentData: IPayment) {
        const existingPayment = await Payments.findOne({
            invceNumber: paymentData.invoiceNumber
        });

        if (!existingPayment) {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.NOT_FOUND("Payment"));
        }

        const result = await Payments.findByIdAndUpdate(existingPayment._id, paymentData, { new: true });
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Payment updated'),
            data: result
        };
    }
    async deletePayment(id: string) {
        const existingPayment = await Payments.findOne({
            _id: id
        });

        if (!existingPayment) {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.NOT_FOUND("Payment"));
        }

        const result = await Payments.findByIdAndDelete(existingPayment._id);
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Payment deleted'),
            data: result
        };
    }

}