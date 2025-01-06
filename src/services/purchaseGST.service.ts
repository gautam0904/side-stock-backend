import { ERROR_MSG, MSG } from "../constants/message.js";
import { statuscode } from "../constants/status.js";
import { IPurchase, PaginatedResponse, QueryOptions } from "../interfaces/purchaseGST.interface.js";
import Purchase from "../models/purchaseGST.model.js";
import { ApiError } from "../utils/apiError.js";
import { PipelineStage } from 'mongoose';

export class PurchaseService {
    async createPurchase(purchaseData: IPurchase){
        const existingPurchase= await Purchase.findOne({
            billNumber: purchaseData.billNumber
        });

        if(existingPurchase){
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.EXISTS('bill number'))
        }

        const result =  await Purchase.create({
            GSTnumber: purchaseData.GSTnumber,
            billNumber: purchaseData.billNumber,
            date: purchaseData.date,
            companyName: purchaseData.companyName,
            supplierName: purchaseData.supplierName,
            supplierNumber: purchaseData.supplierNumber,
            products: purchaseData.products,
            transportAndCasting: purchaseData.transportAndCasting,
            amount: purchaseData.amount,
            sgst: purchaseData.sgst,
            cgst: purchaseData.cgst,
            igst: purchaseData.igst,
            totalAmount: purchaseData.totalAmount
        });

        return {
            statuscode: statuscode.CREATED,
            message: MSG.SUCCESS('Purchase creation'),
            data: result
        };
    }

    async getPurchase(options: QueryOptions): Promise<PaginatedResponse> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search = ''
        } = options;

        const skip = (page - 1) * Number(limit);

        const pipeline: PipelineStage[] = [
            search ? {
                $match: {
                    $or: [
                        { GSTnumber: { $regex: search, $options: 'i' } },
                        { billNumber: { $regex: search, $options: 'i' } },
                        { companyName: { $regex: search, $options: 'i' } },
                        { supplierName: { $regex: search, $options: 'i' } },
                        { supplierNumber: { $regex: search, $options: 'i' } }
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
                        { $skip: skip },
                        { $limit: Number(limit) },
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

        const [result] = await Purchase.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;
        const totalPages = Math.ceil(total / Number(limit));

        return {
            statuscode: statuscode.OK,
            message: "Purchase bills retrieved successfully",
            data: {
                purchaseBills: result.data,
                pagination: {
                    total,
                    currentPage: page,
                    totalPages,
                    limit
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
    
    async getPurchaseByName(options: QueryOptions){
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search = ''
        } = options;

        const skip = (page - 1) * Number(limit);

        const pipeline: PipelineStage[] = [
            search ? {
                $match: {
                    $or: [
                        {
                            supplierName: {
                                $regex: search, $options:
                                    'i'
                            }
                        },
                        {
                            companyName: {
                                $regex: search, $options:
                                    'i'
                            }
                        },
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
                        { $skip: skip },
                        { $limit: Number(limit) },
                    ]
                }
            }
        ].filter(Boolean) as PipelineStage[];

        const [result] = await Purchase.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;
        const totalPages = Math.ceil(total / Number(limit));

        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS("Purchase retrieved"),
            data: {
                customers: result.data,
                pagination: {
                    total,
                    currentPage: page,
                    totalPages,
                    limit
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

    async updatePurchase(purchaseData: IPurchase) {
        const existingPurchase = await Purchase.findOne({
            billNumber: purchaseData.billNumber
        });

        if (!existingPurchase) {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.NOT_FOUND("Purchase"));
        }

        const result = await Purchase.findByIdAndUpdate(existingPurchase._id, purchaseData, { new: true });
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Purchase updated'),
            data: result
        };
    }
    async deletePurchase( id: string) {
        const existingPurchase = await Purchase.findOne({
            _id: id
        });

        if (!existingPurchase) {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.NOT_FOUND("Purchase"));
        }

        const result = await Purchase.findByIdAndDelete(existingPurchase._id);
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Purchase deleted'),
            data: result
        };
    }

}