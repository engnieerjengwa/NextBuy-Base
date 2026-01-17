export interface SignedBy {
    name: string;
    role: 'CUSTOMER' | 'CONCIERGE';
}

export interface OrderHistoryItem {
    id: number;
    imageUrl: string;
    unitPrice: number;
    quantity: number;
    productId: number;
    productName?: string;
}

export interface Address {
    id: number;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}

export interface Customer {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
}

export class OrderHistory {
   constructor(public id: string,
               public orderTrackingNumber: string,
               public totalPrice: number,
               public totalQuantity: number,
               public dateCreated: Date,
               public status: string,
               public deliveryDate?: Date,
               public deliveryStatus?: string,
               public signedBy?: SignedBy,
               public previewImages?: string[],
               public isReturned?: boolean,
               public orderItems?: OrderHistoryItem[],
               public shippingAddress?: Address,
               public billingAddress?: Address,
               public customer?: Customer){}
}
