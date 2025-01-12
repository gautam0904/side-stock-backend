import { ERROR_MSG, MSG } from "../constants/message.js";
import { statuscode } from "../constants/status.js";
import { ApiError } from "../utils/apiError.js";
import { IProduct } from "../interfaces/product.interface.js";
import Product from "../models/products.model.js"
import { PaginatedResponse } from "../interfaces/product.interface.js";
import { QueryOptions } from "../interfaces/customerGST.interface.js";
import { PipelineStage } from "mongoose";

export class ProductService {
    async createProduct(product: IProduct) {
         const [existingProduct] = await Product.aggregate([{
            $match: {
                productName: product.productName,
                size: product.size
            }
         }]);

        if (existingProduct) {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.EXISTS('Product'));
        }

        const result = await Product.create({
            productName: product.productName,
            size: product.size,
            stock: product.stock,
            rented: product.rented,
            loss: product.loss,
        });

        return {
            statuscode: statuscode.CREATED,
            message: MSG.SUCCESS('Product creation'),
            data: result
        };
    }

    async getProduct(options: QueryOptions): Promise<PaginatedResponse> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search = ''
        } = options;

        const skip = (page - 1) * Number(limit);
        const isAllRecords = limit === -1;

        const pipeline: PipelineStage[] = [
            search ? {
                $match: {
                    $or: [
                        { productName: { $regex: search, $options: 'i' } },
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
                        { $skip: skip },
                         ...(isAllRecords ? [] : [{ $skip: skip }, { $limit: Number(limit) }]),
                        {
                            $project:{
                             _id: 1,
                             productName: 1,
                             size: 1,
                             stock: 1,
                             rented: 1,
                             loss: 1,
                            }
                        }
                    ]
                }
            }
        ].filter(Boolean) as PipelineStage[];

        const [result] = await Product.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;
        const totalPages = Math.ceil(total / Number(limit));

        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Product retrieved'),
            data: {
                products: result.data,
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
    

    async updateProducts(products: IProduct) {
 
        const result = await Product.findByIdAndUpdate(products._id, products, { new: true });
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Product updated'),
            data: result
        };
    }

    async deleteProduct( productId: string){
        const result = await Product.findByIdAndDelete(productId);
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Product deleted'),
            data: result
        };
    }
}