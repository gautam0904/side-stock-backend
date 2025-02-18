export interface IProduct{
    _id?:string;
    productName: string;
    size: string;
    stock:number;
    rented:number;
    rate : number;
    loss:number;
    totalStock:number;
    inStock: number;
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