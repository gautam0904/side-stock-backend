export interface ICustomerGST {
  _id?: string;
     customerName: string;
     mobileNumber: string;
     partnerName: string;
     partnerMobileNumber: string;
     reference: string;
     referenceMobileNumber: string;
     residentAddress: string;
     aadharNo: string;
     pancardNo: string;
     aadharPhoto: string;
     panCardPhoto: string;
     customerPhoto: string;
     prizefix: Iprizefix[];
     sites: ISite[];
     GSTnumber: string;
     panCardNumber: string;
     billTo: string;
     billingAddress: string;
     date: string;
}

export interface QueryOptions {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

export interface PaginatedResponse {
    statuscode: number;
    message: string;
    data: {
        customers: ICustomerGST[];
        pagination: {
            total: number;
        };
        metadata: any;
    }
}

export interface ICustomerResponse {
    statuscode: number;
    message: string;
    data: ICustomerGST[];
}

interface Iprizefix {
    productId: string;
    rate: number;
}

export interface ISite {
    siteName: string;
    siteAddress: string;
}
