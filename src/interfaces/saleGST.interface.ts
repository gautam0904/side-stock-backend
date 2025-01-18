export interface ISale {
    GSTnumber: string;
    invoiceNumber: string;
    date: Date;
    billTo: string;
    mobileNumber: string;
    billAddress: string;
    siteName: string;
    siteAddress: string;
    pancard: string;
    products:[{
        productName: string;
        size: number;
        quantity: number;
        rate: number;
        startingDate: Date;
        endingDate: Date;
        amount: number;
    }];
    transportAndCasting: number;
    amount: number;
    sgst: number;
    cgst: Number;
    igst: Number;
    totalAmount: Number;
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
        saleBills: ISale[];
        pagination: {
            total: number;
        };
        metadata: any;
    }
}
