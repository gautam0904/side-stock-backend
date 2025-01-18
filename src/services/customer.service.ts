import Customer from "../models/customer.mdel.js";
import { ERROR_MSG, MSG } from "../constants/message.js";
import { statuscode } from "../constants/status.js";
import { ApiError } from "../utils/apiError.js";
import { PipelineStage, QueryOptions } from 'mongoose';
import { ICustomer } from "../interfaces/nonGSTmodels.interface.js";
import { ICreateCustomerDTO } from "../dto/req.dto.js";
import { CustomerPaginatedResponse } from "../dto/res.dto.js";
import { deleteonCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

export class CustomerService {
    customerCloudinaryURL: string | null = null
    aadharCloudinaryURL: string | null = null
    panCardCloudinaryURL: string | null = null

    async createCustomer(customer: ICreateCustomerDTO) {
        try {
            const existingCustomer = await Customer.findOne({
                customerName: customer.customerName,
                mobileNumber: customer.mobileNumber,
            });

            if (existingCustomer) {
                throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.EXISTS('customer'));
            }
            try {
                if (typeof customer.prizefix === 'string') {
                    customer.prizefix = JSON.parse(customer.prizefix);
                } else if (Array.isArray(customer.prizefix)) {
                    customer.prizefix = customer.prizefix;
                } else if (typeof customer.prizefix === 'object') {
                    customer.prizefix = [customer.prizefix];
                } else {
                    customer.prizefix = [];
                }
                customer.prizefix = customer.prizefix.map((p: any) => ({
                    productName: String(p.productName || ''),
                    size: String(p.size || ''),
                    rate: Number(p.rate) || 0
                }));
            } catch (error) {
                console.error('Error parsing prizefix:', error, customer.prizefix);
                throw new ApiError(
                    statuscode.BADREQUEST,
                    'Invalid prizefix format. Expected array of products.'
                );
            }

            try {
                if (typeof customer.sites === 'string') {
                    customer.sites = JSON.parse(customer.sites);
                } else if (Array.isArray(customer.sites)) {
                    customer.sites = customer.sites;
                } else if (typeof customer.sites === 'object') {
                    customer.sites = [customer.sites];
                } else {
                    customer.sites = [];
                }

                // Validate and clean each site
                customer.sites = customer.sites.map((site: any) => ({
                    siteName: String(site.siteName || ''),
                    siteAddress: String(site.siteAddress || '')
                }));
            } catch (error) {
                console.error('Error parsing sites:', error, customer.sites);
                throw new ApiError(
                    statuscode.BADREQUEST,
                    'Invalid sites format. Expected array of sites.'
                );
            }

            if (customer.customerPhoto) {
                const profile = await uploadOnCloudinary(customer.customerPhoto);
                this.customerCloudinaryURL = profile?.data?.url || null;
            }

            if (customer.aadharPhoto) {
                const profile = await uploadOnCloudinary(customer.aadharPhoto);
                this.aadharCloudinaryURL = profile?.data?.url || null;
            }

            if (customer.panCardPhoto) {
                const profile = await uploadOnCloudinary(customer.panCardPhoto);
                this.panCardCloudinaryURL = profile?.data?.url || null;
            }


            const result = await Customer.create({
                customerName: String(customer.customerName || ''),
                mobileNumber: String(customer.mobileNumber || ''),
                GSTnumber: String(customer.GSTnumber || ''),
                partnerName: String(customer.partnerName || ''),
                partnerMobileNumber: String(customer.partnerMobileNumber || ''),
                reference: String(customer.reference || ''),
                referenceMobileNumber: String(customer.referenceMobileNumber || ''),
                residentAddress: String(customer.residentAddress || ''),
                aadharNo: String(customer.aadharNo || ''),
                pancardNo: String(customer.pancardNo || ''),
                aadharPhoto: this.aadharCloudinaryURL,
                panCardPhoto: this.panCardCloudinaryURL,
                customerPhoto: this.customerCloudinaryURL,
                prizefix: customer.prizefix,
                sites: customer.sites
            });

            // Reset Cloudinary URLs
            this.customerCloudinaryURL = null;
            this.aadharCloudinaryURL = null;
            this.panCardCloudinaryURL = null;

            return {
                statuscode: statuscode.CREATED,
                message: MSG.SUCCESS('Customer creation'),
                data: result,
            }
        } catch (error) {
            if (this.customerCloudinaryURL) {
                await deleteonCloudinary(this.customerCloudinaryURL);
            }
            if (this.aadharCloudinaryURL) {
                await deleteonCloudinary(this.aadharCloudinaryURL);
            }
            if (this.panCardCloudinaryURL) {
                await deleteonCloudinary(this.panCardCloudinaryURL);
            }

            // Reset Cloudinary URLs
            this.customerCloudinaryURL = null;
            this.aadharCloudinaryURL = null;
            this.panCardCloudinaryURL = null;

            return {
                statuscode: error.statuscode || statuscode.INTERNALSERVERERROR,
                message: error.message || ERROR_MSG.DEFAULT_ERROR,
                data: null
            };
        }
    }

    async getCustomers(options: QueryOptions): Promise<CustomerPaginatedResponse> {
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
                        { customerName: { $regex: search, $options: 'i' } },
                        { mobileNumber: { $regex: search, $options: 'i' } },
                        { partnerName: { $regex: search, $options: 'i' } },
                        { reference: { $regex: search, $options: 'i' } },
                        { aadharNo: { $regex: search, $options: 'i' } },
                        { pancardNo: { $regex: search, $options: 'i' } }
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
                                customerName: 1,
                                mobileNumber: 1,
                                siteName: 1,
                                siteAddress: 1,
                                partnerName: 1,
                                partnerMobileNumber: 1,
                                reference: 1,
                                referenceMobileNumber: 1,
                                residentAddress: 1,
                                aadharNo: 1,
                                pancardNo: 1,
                                prizefix: 1,
                                sites: 1,   
                                aadharPhoto: 1,
                                panCardPhoto: 1,
                                customerPhoto: 1,
                            }
                        }
                    ]
                }
            }
        ].filter(Boolean) as PipelineStage[];

        const [result] = await Customer.aggregate(pipeline);

        const total = result.metadata[0]?.total || 0

        return {
            statuscode: statuscode.OK,
            message: "Customers retrieved successfully",
            data: {
                items: result.data,
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
                                billingAddress: 1,
                                aadharPhoto: 1,
                                panCardPhoto: 1,
                                customerPhoto: 1,
                                prizefix: 1,
                                sites: 1
                            }
                        }
                    ]
                }
            }
        ].filter(Boolean) as PipelineStage[];

        const [result] = await Customer.aggregate(pipeline);

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

    async updateCustomer(customer: ICustomer) {
        const existingCustomer = await Customer.findOne({
            _id: customer._id
        });
        console.log(existingCustomer);
        

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

    async deleteCustomer(customerId: string) {
        const existingCustomer = await Customer.findOne({
            _id: customerId
        });

        if (!existingCustomer) {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.NOT_FOUND("Customer"));
        }

        const result = await Customer.findByIdAndDelete(customerId);
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Customer deleted'),
            data: result
        };
    }
}