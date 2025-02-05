export interface IProduct{
    _id?:string;
    productName: string;
    size: string;
    stock:number;
    rented:number;
    loss:number;
    totalStock:number
}

export interface PaginatedResponse {
    statuscode: number;
    message: string;
    data: {
        products: IProduct[];
        pagination: {
            total: number;
        };
        metadata: any;
    }
}