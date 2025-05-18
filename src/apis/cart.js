// 封装购物车相关接口
import request from '@/utils/http'

// 加入购物车
export const addItemToCartAPI = ({ productId, quantity }) => {
  return request({
    url: '/api/v2/cart/items',
    method: 'POST',
    data: {
    productId,
    quantity
    }
  })
}

// 获取购物车列表
export const getCartContentsAPI = () => {
  return request({
    url: '/api/v2/cart',
    method: 'GET',
  })
}

// 删除购物车
export const deleteCartItemAPI = (itemId) => {
  return request({
    url: `/api/v2/cart/items/${itemId}`,
    method: 'DELETE',
    // data: {
    //   itemId
    //   }
  })
}

//修改购物车商品数量
export const updateCartItemQuantityAPI = ({ itemId, quantity }) => {
  return request({
    url: `/api/v2/cart/items/${itemId}`, // 确保 itemId 正确替换
    method: 'PUT',
    data: quantity !== undefined ? { quantity } : {}, // 只有当 quantity 存在时才传递
  });
};


/**
 * 获取购物车信息
 * @returns {Promise<Object>} - 返回购物车信息，包含cartId等
 */
export const getCartInfoAPI = () => {
    return request({
        url: '/api/v2/cart',
        method: 'GET'
    });
};