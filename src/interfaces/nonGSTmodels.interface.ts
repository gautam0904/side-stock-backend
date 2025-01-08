export interface ICustomer {
    _id?: string;
    customerName: string;
    mobileNumber: string;
    siteName: string;
    siteAddress: string;
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
}

interface Iprizefix {
    productId: string;
    size: number;
    rate: number;
}

export interface ISite {
    siteName: string;
    siteAddress: string;
    customerId?: string;
    customerGSTId?: string;
}

