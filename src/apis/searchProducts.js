import httpInstance from '@/utils/http' // 你的axios封装文件路径

/**
 * 搜索商品
 * @param {Object} params
 * @param {string} params.keyword - 搜索关键词（必填）
 * @param {number} [params.page=1] - 当前页码
 * @param {number} [params.limit=10] - 每页数量
 * @param {string} [params.sort] - 排序方式
 * @returns Promise
 */
export const searchProducts = (params) => {
    return httpInstance.get('/api/v2/products/search', {  //这个是已经调整好的获取所有商品的接口
        params: {
            keyword: params.keyword || '',
            page: params.page || 1,
            limit: params.limit || 10,
            sort: params.sort || ''
        }
    })
}
