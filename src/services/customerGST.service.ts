// import Customer from "../models/customer.mdel.js";
// import { ERROR_MSG, MSG } from "../constants/message.js";
// import { statuscode } from "../constants/status.js";
// import { ApiError } from "../utils/apiError.js";
// import { PipelineStage, QueryOptions } from 'mongoose';
// import { ICustomer } from "../interfaces/nonGSTmodels.interface.js";
// import Site from "../models/site.model.js";
// import { ICreateCustomerDTO } from "../dto/req.dto.js";
// import { CustomerPaginatedResponse } from "../dto/res.dto.js";
// import { deleteonCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

// export class CustomerService {
//     customerCloudinaryURL: string | null = null
//     aadharCloudinaryURL: string | null = null
//     panCardCloudinaryURL: string | null = null

//     async createCustomer(customer: ICreateCustomerDTO) {
//         try {
//             const existingCustomer = await Customer.findOne({
//                 customerName: customer.customerName,
//                 mobileNumber: customer.mobileNumber,
//             });

//             if (existingCustomer) {
//                 throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.EXISTS('customer'));
//             }

            

//             if (customer.customerPhoto) {
//                 const profile = await uploadOnCloudinary(customer.customerPhoto);
//                 this.customerCloudinaryURL = profile?.data?.url || null
//             }

//             if (customer.aadharPhoto) {
//                 const profile = await uploadOnCloudinary(customer.aadharPhoto);
//                 this.aadharCloudinaryURL = profile?.data?.url || null
//             }

//             if (customer.panCardPhoto) {
//                 const profile = await uploadOnCloudinary(customer.panCardPhoto);
//                 this.panCardCloudinaryURL = profile?.data?.url || null
//             }


//             const result = await Customer.create({
//                 customerName: customer.customerName,
//                 mobileNumber: customer.mobileNumber,
//                 sites: customer.sites,
//                 partnerName: customer.partnerName,
//                 partnerMobileNumber: customer.partnerMobileNumber,
//                 reference: customer.reference,
//                 referenceMobileNumber: customer.referenceMobileNumber,
//                 residentAddress: customer.residentAddress,
//                 aadharNo: customer.aadharNo,
//                 pancardNo: customer.pancardNo,
//                 aadharPhoto: customer.aadharPhoto,
//                 panCardPhoto: customer.panCardPhoto,
//                 customerPhoto: customer.customerPhoto,
//                 prizefix: customer.prizefix
//             });

//             const siteOperations = customer.sites.map(site => ({
//                 insertOne: {
//                     document: {
//                         siteName: site.siteName,
//                         siteAddress: site.siteAddress,
//                         customerId: result._id
//                     }
//                 }
//             }));

//             const siteResult = await Site.bulkWrite(siteOperations);

//             this.customerCloudinaryURL = null
//             this.aadharCloudinaryURL = null
//             this.panCardCloudinaryURL = null

//             return {
//                 statuscode: statuscode.CREATED,
//                 message: MSG.SUCCESS('Customer creation'),
//                 data: {
//                     ...result,
//                     ...siteResult
//                 }
//             }
//         } catch (error) {
//             if (this.customerCloudinaryURL) {
//                 deleteonCloudinary(this.customerCloudinaryURL);
//             }
//             if (this.aadharCloudinaryURL) {
//                 deleteonCloudinary(this.aadharCloudinaryURL);
//             }
//             if (this.panCardCloudinaryURL) {
//                 deleteonCloudinary(this.panCardCloudinaryURL);
//             }
//             return {
//                 statuscode: error.statuscode || statuscode.INTERNALSERVERERROR,
//                 message: error.message || ERROR_MSG.DEFAULT_ERROR,
//                 data: null
//             }
//         }
//     }

//     async getCustomers(options: QueryOptions): Promise<CustomerPaginatedResponse> {
//         const {
//             sortBy = 'createdAt',
//             sortOrder = 'desc',
//             search = ''
//         } = options;

//         const pipeline: PipelineStage[] = [
//             search ? {
//                 $match: {
//                     $or: [
//                         { GSTnumber: { $regex: search, $options: 'i' } },
//                         { customerName: { $regex: search, $options: 'i' } },
//                         { mobileNumber: { $regex: search, $options: 'i' } },
//                         { partnerName: { $regex: search, $options: 'i' } },
//                         { reference: { $regex: search, $options: 'i' } },
//                         { aadharNo: { $regex: search, $options: 'i' } },
//                         { pancardNo: { $regex: search, $options: 'i' } }
//                     ]
//                 }
//             } : { $match: {} },

//             {
//                 $facet: {
//                     metadata: [
//                         { $count: 'total' }
//                     ],
//                     data: [
//                         { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
//                         {
//                             $project: {
//                                 _id: 1,
//                                 customerName: 1,
//                                 mobileNumber: 1,
//                                 siteName: 1,
//                                 siteAddress: 1,
//                                 partnerName: 1,
//                                 partnerMobileNumber: 1,
//                                 reference: 1,
//                                 referenceMobileNumber: 1,
//                                 residentAddress: 1,
//                                 aadharNo: 1,
//                                 pancardNo: 1,
//                                 prizefix: 1,
//                             }
//                         }
//                     ]
//                 }
//             }
//         ].filter(Boolean) as PipelineStage[];

//         const [result] = await Customer.aggregate(pipeline);

//         const total = result.metadata[0]?.total || 0

//         return {
//             statuscode: statuscode.OK,
//             message: "Customers retrieved successfully",
//             data: {
//                 items: result.data,
//                 pagination: {
//                     total
//                 },
//                 metadata: {
//                     lastUpdated: new Date(),
//                     filterApplied: !!search,
//                     sortField: sortBy,
//                     sortDirection: sortOrder
//                 }
//             }
//         };

//     }

//     async updateCustomer(customer: ICustomer) {
//         const existingCustomer = await Customer.findOne({
//             _id: customer._id
//         });
//         console.log(existingCustomer);


//         if (!existingCustomer) {
//             throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.NOT_FOUND("Customer"));
//         }

//         const result = await Customer.findByIdAndUpdate(existingCustomer._id, customer, { new: true });
//         return {
//             statuscode: statuscode.OK,
//             message: MSG.SUCCESS('Customer updated'),
//             data: result
//         };
//     }

//     async deleteCustomer(customerId: string) {
//         const existingCustomer = await Customer.findOne({
//             _id: customerId
//         });

//         if (!existingCustomer) {
//             throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.NOT_FOUND("Customer"));
//         }

//         const result = await Customer.findByIdAndDelete(customerId);
//         return {
//             statuscode: statuscode.OK,
//             message: MSG.SUCCESS('Customer deleted'),
//             data: result
//         };
//     }
// }