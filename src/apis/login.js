// api/user.js
import request from '@/utils/http.js'

// 注册用户接口
export const registerUser = (data) => {
    return request({
        url: '/api/auth/register',
        method: 'POST',
        data
    })
}
//登录用户接口
export const loginapi = ({username,password}) => {
    return request({
        url: '/api/auth/login',  //记得改
        method: 'POST',
        data: {
            username,
            password
        }
    })
}
//登出用户接口
export const logoutapi = () => {
    return request({
        url: '/api/auth/logout',
        method: 'POST',
        headers: {
            'session-id': localStorage.getItem('session-id'), // 从存储中获取 session-id
        }
    })
}