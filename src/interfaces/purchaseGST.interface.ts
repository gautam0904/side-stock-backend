export interface IPurchase {
    _id?:string;
    GSTnumber: string;
    billNumber: String;
    date: Date;
    companyName: String;
    supplierName: String;
    supplierNumber: String;
    products: IProducts[],
    transportAndCasting: Number;
    amount: Number;
    sgst: Number;
    cgst: Number;
    igst: Number;
    totalAmount: Number;
}

interface IProducts {
    productName: String;
    quantity: Number;
    rate: Number;
    amount: Number;
    size: string;
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
        purchaseBills: IPurchase[];
        pagination: {
            total: number;
        };
        metadata: any;
    }
}

export interface ICustomerResponse {
    statuscode: number;
    message: string;
    data: IPurchase[];
}