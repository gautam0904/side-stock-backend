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
  mobileNumber: string;
  siteName: string;
  siteAddress: string;
  products: IProducts[];
  loading: number;
  unloading: number;
  transportCharge: number;
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


export interface IBill {
  _id?:string;
  customerName: string;
  mobileNumber: string;
  partnerName: string;
  billNumber: String;
  partnerMobileNumber: string;
  date: Date;
  billTo: string;
  reference: string;
  referenceMobileNumber: string;
  billAddress: string;
  siteName: string;
  siteAddress: string;
  pancard: string;
  products: Iproduct[],
  serviceCharge: Number;
  damageCharge: Number;
  totalPayment: Number;
}

interface Iproduct {
  productName: string
  quantity: Number;
  rate: Number;
  startingDate: Date;
  endingDate: Date;
  amount: Number;
}