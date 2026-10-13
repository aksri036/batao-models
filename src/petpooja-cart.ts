export interface PetpoojaCartItem {
  itemId: string;

  quantity: number;
  unitPrice: number;

  variation?: {
    variationId: string;
  };

  addons?: {
    groupId: string;
    addonItemId: string;
    quantity: number;
  }[];

  instructions?: string;
}
export interface BtPetpoojaCart {
  storeId: string;

  buyerId: string;

  items: PetpoojaCartItem[];

  discountIds: string[];

  /** total of all items + addons */
  cartTotal: number;

  updatedAt?: any;
}
 export interface PetpoojaOrderCartItem {
  itemId: string;
  quantity: number;

  variation?: {
    variationId: string;
  };

  addons?: {
    groupId: string;
    addonItemId: string;
    quantity: number;
  }[];

  instructions?: string;
}