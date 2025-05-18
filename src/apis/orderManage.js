// 订单管理相关接口
import request from '@/utils/http'

/**
 * 管理订单（发货/取消）
 * @param {string} orderId - 订单ID
 * @param {Object} data - 请求数据
 * @param {string} data.action - 操作类型：'ship' 发货，'cancel' 取消
 * @param {string} [data.trackingNumber] - 物流单号（发货时可选）
 * @returns {Promise<Object>} - 返回操作结果
 */
export const manageOrderAPI = (orderId, data) => {
    return request({
        url: `/api/v2/seller/orders/${orderId}`,
        method: 'PUT',
        data: data
    });
}; 