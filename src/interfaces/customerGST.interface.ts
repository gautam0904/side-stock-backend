export interface ICustomerGST {
    GSTnumber: string;
    panCardNumber: string;
    billTo: string;
    customerName: string;
    mobileNumber: string;
    siteName: string;
    siteAddress: string;
    billingAddress: string;
    date: string;
}

export interface QueryOptions {
    page?: number;
    limit?: number;
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
            currentPage: number;
            totalPages: number;
            limit: number;
        };
        metadata: any;
    }
}

export interface ICustomerResponse {
    statuscode: number;
    message: string;
    data: ICustomerGST[];
}
