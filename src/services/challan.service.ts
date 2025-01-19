import { ERROR_MSG, MSG } from "../constants/message.js";
import { statuscode } from "../constants/status.js";
import { ApiError } from "../utils/apiError.js";
import { IChallan } from "../dto/req.dto.js";
import Challan from "../models/challan.model.js"
import { PaginatedResponse } from "../interfaces/product.interface.js";
import { QueryOptions } from "../interfaces/customerGST.interface.js";
import { PipelineStage } from "mongoose";

export class ChallanService {
    async createChallan(challan: IChallan) {
        const [existingChallan] = await Challan.aggregate([{
            $match: {
                custonerName: challan.custsomerName,
                mobileNumber: challan.mobileNumber
            }
        }]);

        if (existingChallan) {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.EXISTS('Challan'));
        }

        challan.products = challan.products.map((p)=>{
            return{
                date:p.date,
                productName:p.productName,
                size: p.size,
                quantity:p.quantity,
                rate:p.rate,
                amount: p.amount,
            }
        })

        const result = await Challan.create({
            challanNumber: challan.challanNumber,
            challenType: challan.type,
            date: challan.date,
            customerName: challan.customerName,
            mobileNumber: challan.mobileNumber,
            siteName: challan.siteName,
            siteAddress: challan.siteAddress,
            products: challan.products,
            loading: challan.loading,
            unloading: challan.unloading,
            transportCharge: challan.transportCharge,
            amount: challan.amount,
            totalAmount: challan.totalAmount,
        });

        return {
            statuscode: statuscode.CREATED,
            message: MSG.SUCCESS('Challan creation'),
            data: result
        };
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