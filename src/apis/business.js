
import request from '@/utils/http.js'

// 查看商品
export const getproductsList = (data) => {
    return request({
        url: '/api/seller/products',
        method: 'get',
        data
    })
}
//修改商品信息
export const reviseProducts = (data,productId) => {
    return request({
        url: `/api/seller/products/${productId}`,
        method: 'put',
        data
    })
}

//删除商品
export const deleteProducts = (productId) => {
    return request({
        url: `/api/seller/products/${productId}`,
        method: 'delete',
        
    })
}

//上架商品
export const putawayProducts = (data) => {
    return request({
        url: `/api/seller/products`,
        method: 'post',
        data
    })
}

//查看订单
/**
 * 获取卖家订单列表
 * @returns {Promise} 返回订单列表
 */
export const viewOrders = () => {
    return request({
        url: `/api/seller/orders`,
        method: 'get',
    })
}

//管理订单

/**
 * 管理订单（卖家视角）
 * @param {string} orderId 订单 ID
 * @param {string} action 操作类型 ('ship' | 'cancel')
 * @param {string} [trackingNumber] 物流单号（可选，仅在发货时传递）
 * @returns {Promise} 返回操作结果
 */
export const manageOrderAPI = (orderId, action, trackingNumber = '') => {
    return request({
        url: `/api/seller/orders/${orderId}`,
        method: 'PUT',
        data: {
            action,
            ...(trackingNumber && { trackingNumber }) // 只有发货时才传递 trackingNumber
        }
    })
}

//添加商品
export const addProducts = (data) => {
    return request({
        url: `/api/seller/products`,
        method: 'post',
        data
    })
}
/**
 * 上传图片
 * @param {string} productId - 商品 ID
 * @param {FormData} formData - 包含图片的 FormData 对象
 * @returns {Promise<Object>} - 返回包含图片路径的对象
 */
export const uploadImageAPI = (productId, formData) => {
    console.log("Uploading Image - Product ID:", productId); // Debug 日志
    if (!productId) {
        console.error("Error: productId is missing in uploadImageAPI!");
        return Promise.reject("Product ID is missing");
    }
    return request({
        url: `/api/image/${productId}`,  // 确保这个 URL 路径正确
        method: 'POST',
        data: formData,
    });
};
