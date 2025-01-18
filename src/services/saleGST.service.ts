import { ERROR_MSG, MSG } from "../constants/message.js";
import { statuscode } from "../constants/status.js";
import { ISale, PaginatedResponse, QueryOptions } from "../interfaces/saleGST.interface.js";
import SalesGST from "../models/saleGST.model.js";
import { ApiError } from "../utils/apiError.js";
import { PipelineStage } from 'mongoose';

export class SaleService {
    async createSale(saleData: ISale){
        const existingSale= await SalesGST.findOne({
            invoiceNumber: saleData.invoiceNumber
        });

        if(existingSale){
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.EXISTS('bill number'))
        }

        const result =  await SalesGST.create({
            GSTnumber: saleData.GSTnumber,
            invoiceNumber: saleData.invoiceNumber,
            billTo: saleData.billTo,
            mobileNumber: saleData.mobileNumber,
            billAddress: saleData.billAddress,
            siteName: saleData.siteName,
            siteAddress: saleData.siteAddress,
            pancard: saleData.pancard,
            products: saleData.products,
            transportAndCasting: saleData.transportAndCasting,
            amount: saleData.amount,
            sgst: saleData.sgst,
            cgst: saleData.cgst,
            igst: saleData.igst,
            totalAmount: saleData.totalAmount
        });

        return {
            statuscode: statuscode.CREATED,
            message: MSG.SUCCESS('Sale creation'),
            data: result
        };
    }

    async getSale(options: QueryOptions): Promise<PaginatedResponse> {
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
                        { billTo: { $regex: search, $options: 'i' } },
                        { mobileNumber: { $regex: search, $options: 'i' } },
                        { billAddress: { $regex: search, $options: 'i' } },
                        { siteName: { $regex: search, $options: 'i' } },
                        { siteAddress: { $regex: search, $options: 'i' } },
                        { pancard: { $regex: search, $options: 'i' } }
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

        const [result] = await SalesGST.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;

        return {
            statuscode: statuscode.OK,
            message: "Sales retrieved successfully",
            data: {
                saleBills: result.data,
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
    
    async getSaleByName(options: QueryOptions){
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
                            billTo: {
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

        const [result] = await SalesGST.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;

        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS("Sale retrieved"),
            data: {
                saleBills: result.data,
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

    async updateSale(saleData: ISale) {
        const existingSale = await SalesGST.findOne({
            invceNumber: saleData.invoiceNumber
        });

        if (!existingSale) {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.NOT_FOUND("Sale"));
        }

        const result = await SalesGST.findByIdAndUpdate(existingSale._id, saleData, { new: true });
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Sale updated'),
            data: result
        };
    }
    async deleteSale( id: string) {
        const existingSale = await SalesGST.findOne({
            _id: id
        });

        if (!existingSale) {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.NOT_FOUND("Sale"));
        }

        const result = await SalesGST.findByIdAndDelete(existingSale._id);
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Sale deleted'),
            data: result
        };
    }

}