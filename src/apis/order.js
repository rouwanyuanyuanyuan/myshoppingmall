// 订单相关接口
import request from '@/utils/http'

/**
 * 提交订单
 * @param {string} cartId - 购物车ID
 * @param {Object} orderCreateVO - 地址ID等订单创建信息
 * @returns {Promise<Object>} - 返回包含订单ID的对象
 */
export const submitOrderAPI = (cartId, orderCreateVO) => {
    return request({
        url: `/api/orders/${cartId}`,  // 请求路径与后端一致
        method: 'POST',                // 请求方法为 POST
        data: orderCreateVO,           // 请求体数据，确保传递了订单创建信息
    });
};

/**
 * 取消订单
 * @param {string} orderId - 订单ID
 * @param {string} sessionId - 用户会话ID (需在请求头中传递)
 * @returns {Promise<void>} - 成功删除返回 204 No-Content，无返回内容
 */
export const cancelOrderAPI = (orderId, sessionId) => {
    return request({
        url: `/api/orders/${orderId}`, // 请求路径与后端一致
        method: 'DELETE',             // 请求方法为 DELETE
    });
};