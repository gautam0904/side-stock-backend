import { ICustomer } from "../interfaces/nonGSTmodels.interface.js";
import { ISite } from "../interfaces/nonGSTmodels.interface.js";

export interface ICreateCustomerDTO extends ICustomer {
    sites: ISite[];
}