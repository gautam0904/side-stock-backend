export interface IPurchase {
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
        purchasBills: IPurchase[];
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
    data: IPurchase[];
}