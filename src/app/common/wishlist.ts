export interface Wishlist {
  id: number;
  name: string;
  items: WishlistItem[];
  dateCreated: Date;
}

export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  productPrice: number;
  productInStock: boolean;
  dateAdded: Date;
}
