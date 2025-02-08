import { ERROR_MSG, MSG } from "../constants/message.js";
import { statuscode } from "../constants/status.js";
import { IPurchase, PaginatedResponse, QueryOptions } from "../interfaces/purchaseGST.interface.js";
import PurchaseGST from "../models/purchaseGST.model.js";
import Product from "../models/products.model.js";
import { ApiError } from "../utils/apiError.js";
import { PipelineStage } from 'mongoose';

export class PurchaseService {
    async createPurchase(purchaseData: IPurchase){

        const existingPurchase= await PurchaseGST.findOne({
            billNumber: purchaseData.billNumber,
        });

        if(existingPurchase){
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.EXISTS('bill number'))
        }

        const databaseProduct = purchaseData.products.map((p)=>{
            return {
                productName: p.productName,
                quantity: p.quantity,
                rate: p.rate,
                amount: p.amount,
                size : p.size
            }
        });        

        const result =  await PurchaseGST.create({
            GSTnumber: purchaseData.GSTnumber,
            billNumber: purchaseData.billNumber,
            date: purchaseData.date,
            companyName: purchaseData.companyName,
            supplierName: purchaseData.supplierName,
            supplierNumber: purchaseData.supplierNumber,
            products: databaseProduct,
            transportAndCasting: purchaseData.transportAndCasting,
            amount: purchaseData.amount,
            sgst: purchaseData.sgst,
            cgst: purchaseData.cgst,
            igst: purchaseData.igst,
            totalAmount: purchaseData.totalAmount
        });
        
        const updatePromises = purchaseData.products.map((product) => ({
            updateOne: {
              filter: { 
                productName: product.productName.trim(),  
                size: product.size.trim()  
              },
              update: {
                $inc: { stock: product.quantity }
              },
            },
          }));
          
          try {
            const result: any = await Product.bulkWrite(updatePromises);
          } catch (err) {
            console.error("Error during bulk update:", err);
          }
          

        return {
            statuscode: statuscode.CREATED,
            message: MSG.SUCCESS('Purchase creation'),
            data: result
        };
    }

    async getPurchase(options: QueryOptions): Promise<PaginatedResponse> {
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
                        {
                            $project:{
                             _id: 1,
                             GSTnumber:1,
                             billNumber: 1,
                             date: 1,
                             companyName: 1,
                             supplierName: 1,
                             supplierNumber: 1,
                             products: 1,
                             transportAndCasting: 1,
                             amount: 1,
                             sgst: 1,
                             cgst: 1,
                             igst: 1,
                             totalAmount: 1
                            }
                        }
                    ]
                }
            }
        ].filter(Boolean) as PipelineStage[];

        const [result] = await PurchaseGST.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;

        return {
            statuscode: statuscode.OK,
            message: "Purchase bills retrieved successfully",
            data: {
                purchaseBills: result.data,
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
    
    async getPurchaseByName(options: QueryOptions){
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
                    ]
                }
            }
        ].filter(Boolean) as PipelineStage[];

        const [result] = await PurchaseGST.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS("Purchase retrieved"),
            data: {
                customers: result.data,
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

    async updatePurchase(purchaseData: IPurchase) {
      
        const result = await PurchaseGST.findByIdAndUpdate(purchaseData._id, purchaseData, { new: true });
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Purchase updated'),
            data: result
        };
    }
    async deletePurchase( id: string) {
    
        const result = await PurchaseGST.findByIdAndDelete(id);
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Purchase deleted'),
            data: result
        };
    }

}