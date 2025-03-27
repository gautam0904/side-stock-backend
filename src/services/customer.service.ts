import Customer from "../models/customer.mdel.js";
import { ERROR_MSG, MSG } from "../constants/message.js";
import { statuscode } from "../constants/status.js";
import { ApiError } from "../utils/apiError.js";
import { PipelineStage, QueryOptions } from 'mongoose';
import { ICustomer } from "../interfaces/nonGSTmodels.interface.js";
import { ICreateCustomerDTO } from "../dto/req.dto.js";
import { CustomerPaginatedResponse } from "../dto/res.dto.js";
import { deleteonCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { json } from "stream/consumers";

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
                    siteAddress: String(site.siteAddress || ''),
                    challanNumber: String(site.challanNumber),
                    prizefix : site.prizefix?.map((p: any) => ({
                        productName: p?.productName,
                        size: p?.size,
                        rate: p?.rate,
                    }))
                }));
            

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
                GSTnumber: String(customer.GSTnumber),
                customerName: String(customer.customerName || ''),
                mobileNumber: String(customer.mobileNumber || ''),
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

    async getCustomerByName(options: QueryOptions) {
        const {
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search = '',
            name = ''
        } = options;
    
        const matchStage: PipelineStage | null = name
            ? {
                $match: {
                    customerName: {
                        $regex: `^${name}`, 
                        $options: 'i'        
                    }
                }
            }
            : null;
    
        const pipeline: PipelineStage[] = [
            ...(matchStage ? [matchStage] : []), 
    
            {
                $facet: {
                    metadata: [
                        { $count: 'total' }  
                    ],
                    data: [
                        { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } }  
                    ]
                }
            }
        ];
    
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
                    filterApplied: !!name,  
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
    
        // Remove JSON.parse for sites
        if (customer.sites) {
            customer.sites = customer.sites.map((s: any) => ({
                siteName: s.siteName,
                siteAddress: s.siteAddress,
                challanNumber: s.challanNumber,
                prizefix : s.prizefix?.map((p: any) => ({
                    productName: p?.productName,
                    size: p?.size,
                    rate: p?.rate,
                }))
            }));
        }
    
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


    async getCustomerById(id: string) {
        const existingCustomer = await Customer.findOne({
            _id: id
        });
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('Customer get'),
            data: existingCustomer
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