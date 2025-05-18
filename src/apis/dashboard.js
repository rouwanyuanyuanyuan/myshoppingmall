import request from "@/utils/http";

// 获取销售趋势数据

export const getSalesTrendData = ({ year, month, detail = true }) => {
  return request({
    url: "/api/v2/seller/reports/monthly",
    method: "GET",
    params: {
      year,
      month,
      detail
    },
  });
};
