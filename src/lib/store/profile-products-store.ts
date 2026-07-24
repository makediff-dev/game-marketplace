"use client";

import { create } from "zustand";
import {
  buildCreatedSaleOrder,
  type OrderDetail,
} from "@/lib/mock/orders";
import {
  buildUserProductDetail,
  type ProductDetail,
  type UserCreatedProductInput,
} from "@/lib/mock/product-details";
import type { ProfileListItem } from "@/lib/mock/profile-items";

interface CreatedListingResult {
  productId: string;
  saleOrderId: string;
}

interface ProfileProductsState {
  createdProducts: ProfileListItem[];
  createdProductDetails: Record<string, ProductDetail>;
  createdSaleOrders: Record<string, OrderDetail>;
  addCreatedProduct: (input: Omit<UserCreatedProductInput, "id">) => CreatedListingResult;
  getCreatedProductDetail: (id: string) => ProductDetail | undefined;
  getCreatedSaleOrder: (id: string) => OrderDetail | undefined;
}

export const useProfileProductsStore = create<ProfileProductsState>((set, get) => ({
  createdProducts: [],
  createdProductDetails: {},
  createdSaleOrders: {},
  addCreatedProduct: (input) => {
    const timestamp = Date.now();
    const productId = `created-${timestamp}`;
    const saleOrderId = `sell-created-${timestamp}`;
    const dealId = `deal-${timestamp.toString().slice(-6)}`;
    const productDetail = buildUserProductDetail({ ...input, id: productId });
    const saleOrder = buildCreatedSaleOrder({
      id: saleOrderId,
      dealId,
      title: input.title,
      price: input.price,
    });

    const productItem: ProfileListItem = {
      id: productId,
      tab: "products",
      status: "active",
      title: input.title,
      price: input.price,
      href: `/product/${productId}`,
    };

    const saleItem: ProfileListItem = {
      id: saleOrderId,
      tab: "sales",
      status: "pending",
      title: input.title,
      price: input.price,
      href: `/profile/orders/${saleOrderId}`,
    };

    set({
      createdProducts: [saleItem, productItem, ...get().createdProducts],
      createdProductDetails: {
        ...get().createdProductDetails,
        [productId]: productDetail,
      },
      createdSaleOrders: {
        ...get().createdSaleOrders,
        [saleOrderId]: saleOrder,
      },
    });

    return { productId, saleOrderId };
  },
  getCreatedProductDetail: (id) => get().createdProductDetails[id],
  getCreatedSaleOrder: (id) => get().createdSaleOrders[id],
}));
