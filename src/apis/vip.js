// 会员中心所用接口
import request from '@/utils/http'

//查询我的订单
export const viewsOrders = (params) => {
    return request({
        url: '/api/v2/orders',
        method: 'GET',
        // params
    })
}


/**
 * 添加收货地址
 * @param {Object} addressData - 地址数据
 * @param {string} addressData.address - 详细地址
 * @param {string} addressData.city - 城市
 * @param {string} addressData.postalCode - 邮政编码
 * @returns {Promise<Object>} - 返回添加成功消息
 */
export const addAddressAPI = (addressData) => {
    return request({
        url: '/api/v2/users/address',
        method: 'POST',
        data: addressData
    });
};

/**
 * 更新地址信息
 * @param {string} addressId - 地址ID
 * @param {Object} addressData - 地址数据
 * @param {string} addressData.address - 详细地址
 * @param {string} addressData.city - 城市
 * @param {string} addressData.postalCode - 邮政编码
 * @returns {Promise<void>} - 无内容返回 (204 No-Content)
 */
export const updateAddressAPI = (addressId, addressData) => {
    return request({
        url: `/api/v2/users/address/${addressId}`,  // 使用模板字符串动态插入 addressId
        method: 'PUT',
        data: addressData
    });
};


/**
 * 删除地址信息
 * @param {string} addressId - 地址ID
 * @returns {Promise<void>} - 无内容返回 (204 No-Content)
 */
export const deleteAddressAPI = (addressId) => {
    return request({
        url: `/api/v2/users/address/${addressId}`,
        method: 'DELETE'
    });
};

/**
 * 获取用户地址列表
 * @returns {Promise<Object>} - 返回包含地址数组的对象
 */
export const getAddressListAPI = () => {
    return request({
        url: '/api/v2/users/address',
        method: 'GET'
    });
};

// 获取我的收藏列表
export const getMyCollect = (page=1,limit=5) => {
    return request({
        url: '/api/v2/users/favorites',
        method: 'GET',
        params:{
            page,
            limit
        }
    })
};

//移出收藏
export const removeCollect = (id) => {
    return request({
        url: `/api/v2/users/favorites/${id}`,
        method: 'DELETE'
    })
};

// 添加商品收藏
export const addCollect = (productId) => {
    return request({
        url: `/api/v2/users/favorites/${productId}`,
        method: 'POST',
    })
}