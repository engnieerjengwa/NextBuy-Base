export interface GuestCheckoutRequest {
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;
  shippingAddress: GuestAddress;
  billingAddress: GuestAddress;
  totalPrice: number;
  totalQuantity: number;
  orderItems: GuestOrderItem[];
}

export interface GuestAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface GuestOrderItem {
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  productId: number;
}
