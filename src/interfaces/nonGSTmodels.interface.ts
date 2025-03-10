export interface ICustomer {
    _id?: string;
    customerName: string;
    mobileNumber: string;
    partnerName: string;
    partnerMobileNumber: string;
    reference: string;
    referenceMobileNumber: string;
    residentAddress: string;
    aadharNo: string;
    pancardNo: string;
    aadharPhoto: string;
    panCardPhoto: string;
    customerPhoto: string;
    challanNumber: string;
    sites: ISite[];
    GSTnumber: string;
    panCardNumber: string;
    billTo: string;
    billingAddress: string;
    date: string;
}

interface Iprizefix {
    productName: string;
    size: string;
    rate: number;
}

export interface ISite {
    siteName: string;
    siteAddress: string;
    challanNumber:string;
    prizefix: Iprizefix[];
}

