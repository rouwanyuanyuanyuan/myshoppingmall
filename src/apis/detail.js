import httpInstance from "@/utils/http"; // 你的 axios 实例路径

// 获取产品详情
export const getProductById = (productId) => {
  return httpInstance.get(`/api/products/${productId}`);
};

// 获取评价
export const getEvaluate = ({ productId, page = 1, limit = 10 }) => {
  return httpInstance({
    url: `/api/products/${productId}/reviews`,
    method: "get",
    params: {
      page,
      limit,
    },
  });
};

// 提交评价
export const submitEvaluate = ({ productId, comment, rating }) => {
  return httpInstance({
    url: `/api/products/${productId}/reviews`,
    method: "post",
    data: { comment, rating },
  });
};
