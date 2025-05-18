// src/apis/promotionInfo.js
import httpInstance from "@/utils/http";

export const getPromotionByProductId = (productId) => {
  return httpInstance.get(`/api/v2/products/${productId}/promotion`);
};