export class Product {
  constructor(
    public id: number,
    public sku: string,
    public name: string,
    public description: string,
    public unitPrice: number,
    public imageUrl: string,
    public active: boolean,
    public unitsInStock: number,
    public dateCreated: Date,
    public lastUpdated: Date,
    // Phase 2: Extended fields
    public originalPrice: number = 0,
    public discountPercentage: number = 0,
    public brand: string = '',
    public specifications: string = '',
    public weightKg: number = 0,
    public lengthCm: number = 0,
    public widthCm: number = 0,
    public heightCm: number = 0,
    public videoUrl: string = '',
    public warrantyInfo: string = '',
    public isNew: boolean = false,
    public averageRating: number = 0,
    public reviewCount: number = 0,
  ) {}
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  altText: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: number;
  variantType: string;
  variantValue: string;
  skuSuffix: string;
  priceAdjustment: number;
  unitsInStock: number;
  imageUrl: string;
  isActive: boolean;
}

export interface ProductSearchResult {
  id: number;
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  imageUrl: string;
  active: boolean;
  unitsInStock: number;
  originalPrice: number;
  discountPercentage: number;
  brand: string;
  isNew: boolean;
  averageRating: number;
  reviewCount: number;
  categoryId: number;
  categoryName: string;
}
