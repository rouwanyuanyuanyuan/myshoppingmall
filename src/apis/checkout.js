import request from '@/utils/http';

// 提交支付订单
export const submitPayment = (orderId) => {
    return request({
        url: `/api/v1/payment/${orderId}`,
        method: 'POST'
    });
};

// 查询支付状态
export const getPaymentStatus = (orderId) => {
    return request({
        url: `/api/v1/payment/${orderId}`,
        method: 'GET'
    });
};
