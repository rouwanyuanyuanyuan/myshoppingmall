// src/apis/promotion.js
import httpInstance from "@/utils/http";

export const getActivePromotions = () => {
  return httpInstance.get("/api/promotions/active");
};
