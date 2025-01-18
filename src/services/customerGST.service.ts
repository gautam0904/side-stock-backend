import { ERROR_MSG, MSG } from "../constants/message.js";
import { statuscode } from "../constants/status.js";
import { ICustomerGST, PaginatedResponse, QueryOptions } from "../interfaces/customerGST.interface.js";
import CustomerGST from "../models/customerGST.model.js";
import { ApiError } from "../utils/apiError.js";
import { PipelineStage } from 'mongoose';

export class CustomerGSTService {
    async createCustomer(customer: ICustomerGST) {
        const existingCustomer = await CustomerGST.findOne({
            GSTnumber: customer.GSTnumber
        });

        if (existingCustomer) {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.EXISTS('customer'));
        }

        const result = await CustomerGST.create({
            GSTnumber: customer.GSTnumber,
            panCardNumber: customer.panCardNumber,
            billTo: customer.billTo,
            customerName: customer.customerName,
            mobileNumber: customer.mobileNumber,
            siteName: customer.siteName,
            siteAddress: customer.siteAddress,
            billingAddress: customer.billingAddress,
            date: customer.date
        });

        return {
            statuscode: statuscode.CREATED,
            message: MSG.SUCCESS('Customer creation'),
            data: result
        };
    }

    async getCustomers(options: QueryOptions): Promise<PaginatedResponse> {
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
                        {
                            $project: {
                                _id: 1,
                                GSTnumber: 1,
                                panCardNumber: 1,
                                date  : 1,
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

        const [result] = await CustomerGST.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;

        return {
            statuscode: statuscode.OK,
            message: "Customers retrieved successfully",
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

    async getCustomerByName(options: QueryOptions){
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

        const [result] = await CustomerGST.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0;

        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS("Customers retrieved"),
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

    async updateCustomer(customer: ICustomerGST) {
        

        const result = await CustomerGST.findByIdAndUpdate(customer._id, customer, { new: true });
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Customer updated'),
            data: result
        };
    }

    async deleteCustomer( customerId: string){
        const result = await CustomerGST.findByIdAndDelete(customerId);
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Customer deleted'),
            data: result
        };
    }
}