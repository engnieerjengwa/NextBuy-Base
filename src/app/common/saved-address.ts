export interface SavedAddress {
  id: number;
  label: string;
  street: string;
  city: string;
  province: string;
  country: string;
  zipCode: string;
  phoneNumber: string;
  isDefault: boolean;
}

export interface SavedAddressRequest {
  label: string;
  street: string;
  city: string;
  province: string;
  country: string;
  zipCode: string;
  phoneNumber: string;
  isDefault: boolean;
}
