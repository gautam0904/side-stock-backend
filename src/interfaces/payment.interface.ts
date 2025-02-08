export interface IPayment {
    _id?: string;
    GSTnumber?: string;
    panCardNumber?: string;
    invoiceNumber?: string;
    billNumber: string;
    siteName: string;
    mobileNumber: string;
    withGST:boolean;
    date: Date;
    customerName: string;
    totalPayment: Number;
    duePayment: Number;
    makePayment: Number;
    paymentType: string;
    remark?: string;
    billAddress?:string;
    siteAddress?:string
    products?:[{
        productName: string;
        size: Number;
        quantity: Number;
        rate: Number;
        startingDate: Date;
        endingDate: Date;
        amount: Number;
    }];
    transportAndCasting? : string;
    sgst?: Number;
    cgst?: Number;
    igst?: Number;
    totalAmount?: Number;
}

export interface QueryOptions {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

export interface PaginatedResponse {
    [x: string]: any;
    statuscode: number;
    message: string;
    data: {
        payments: IPayment[];
        pagination: {
            total: number;
        };
        metadata: any;
    }
}

export interface ICustomerResponse {
    statuscode: number;
    message: string;
    data: IPayment[];
}


export interface ISite {
    siteName: string;
    siteAddress: string;
}
