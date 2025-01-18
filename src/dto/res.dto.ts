import { ICustomer } from "../interfaces/nonGSTmodels.interface.js";

export interface IPagination {
    total: number;
}

export interface PaginatedResponse<T> {
    statuscode: number;
    message: string;
    data: {
        items: T[];
        pagination: IPagination;
        metadata?: any;
    }
}

export type CustomerPaginatedResponse = PaginatedResponse<ICustomer>;

