// src/apis/promotionInfo.js
import httpInstance from "@/utils/http";

export const getPromotionByProductId = (productId) => {
  return httpInstance.get(`/api/v1/products/${productId}/promotion`);
};