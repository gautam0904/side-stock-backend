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
    prizefix: Iprizefix[];
    sites: ISite[];
    GSTnumber: string;
    panCardNumber: string;
    billTo: string;
    billingAddress: string;
    date: string;
}

interface Iprizefix {
    productId: string;
    rate: number;
}

export interface ISite {
    siteName: string;
    siteAddress: string;
}

