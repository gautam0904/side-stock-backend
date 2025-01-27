import { ICustomer } from "../interfaces/nonGSTmodels.interface.js";
import { ISite } from "../interfaces/nonGSTmodels.interface.js";

export interface ICreateCustomerDTO extends ICustomer {
  sites: ISite[];
}

export interface IChallan {
  no?: number;
  _id?: string;
  challanNumber: string;
  type: string;
  date: Date;
  custsomerName: string;
  customerId: string;
  mobileNumber: string;
  siteName: string;
  siteAddress: string;
  products: IProducts[];
  loading: number;
  unloading: number;
  transportCharge: number;
  serviceCharge: Number;
  damageCharge: Number;
  amount: number;
  totalAmount: number;
  [key: string]: any;
}

interface IProducts {
  date?: Date;
  _id?: string;
  productName: string;
  size: string;
  quantity?: number;
  rate?: number;
  amount?: number;
}
