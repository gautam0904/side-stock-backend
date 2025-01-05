import { ERROR_MSG, MSG } from "../constants/message.js";
import { statuscode } from "../constants/status.js";
import { ICustomer, PaginatedResponse, QueryOptions } from "../interfaces/customer.interface.js";
import Customer from "../models/customer.model.js";
import { ApiError } from "../utils/apiError.js";
import { PipelineStage } from 'mongoose';

export class CustomerService {
    async createCustomer(customer: ICustomer) {
        const existingCustomer = await Customer.findOne({
            GSTnumber: customer.GSTnumber
        });

        if (existingCustomer) {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.EXISTS('customer'));
        }

        const result = await Customer.create({
            GSTnumber: customer.GSTnumber,
            panCardNumber: customer.panCardNumber,
            billTo: customer.billTo,
            customerName: customer.customerName,
            mobileNumber: customer.mobileNumber,
            siteName: customer.siteName,
            siteAddress: customer.siteAddress,
            billingAddress: customer.billingAddress
        });

        return {
            statuscode: statuscode.CREATED,
            message: MSG.SUCCESS('Customer creation'),
            data: result
        };
    }

    async getCustomers(options: QueryOptions): Promise<PaginatedResponse> {
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
                        {
                            panCardNumber: {
                                $regex: search, $options:
                                    'i'
                            }
                        },
                        {
                            invoicenumber: {
                                $regex: search, $options:
                                    'i'
                            }
                        },
                        { billTo: { $regex: search, $options: 'i' } },
                        {
                            customerName: {
                                $regex: search, $options:
                                    'i'
                            }
                        },
                        {
                            mobileNumber: {
                                $regex: search, $options:
                                    'i'
                            }
                        },
                        { siteName: { $regex: search, $options: 'i' } },
                        {
                            siteAddress: {
                                $regex: search, $options:
                                    'i'
                            }
                        },
                        {
                            billingAddress: {
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
                        {
                            $project: {
                                _id: 1,
                                GSTnumber: 1,
                                panCardNumber: 1,
                                invoicenumber: 1,
                                billTo: 1,
                                customerName: 1,
                                mobileNumber: 1,
                                siteName: 1,
                                siteAddress: 1,
                                billingAddress: 1
                            }
                        }
                    ]
                }
            }
        ].filter(Boolean) as PipelineStage[];

        const [result] = await Customer.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;
        const totalPages = Math.ceil(total / Number(limit));

        return {
            statuscode: statuscode.OK,
            message: "Customers retrieved successfully",
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

    async getCustomerByName(options: QueryOptions){
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
                        { $skip: skip },
                        { $limit: Number(limit) },
                        {
                            $project: {
                                _id: 1,
                                GSTnumber: 1,
                                panCardNumber: 1,
                                invoicenumber: 1,
                                billTo: 1,
                                customerName: 1,
                                mobileNumber: 1,
                                siteName: 1,
                                siteAddress: 1,
                                billingAddress: 1
                            }
                        }
                    ]
                }
            }
        ].filter(Boolean) as PipelineStage[];

        const [result] = await Customer.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;
        const totalPages = Math.ceil(total / Number(limit));

        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS("Customers retrieved"),
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

    async updateCustomer(customer: ICustomer) {
        const existingCustomer = await Customer.findOne({
            GSTnumber: customer.GSTnumber
        });

        if (!existingCustomer) {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.NOT_FOUND("Customer"));
        }

        const result = await Customer.findByIdAndUpdate(existingCustomer._id, customer, { new: true });
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Customer updated'),
            data: result
        };
    }

    async deleteCustomer(customer: ICustomer) {
        const existingCustomer = await Customer.findOne({
            GSTnumber: customer.GSTnumber
        });

        if (!existingCustomer) {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.NOT_FOUND("Customer"));
        }

        const result = await Customer.findByIdAndDelete(existingCustomer._id);
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Customer deleted'),
            data: result
        };
    }
}