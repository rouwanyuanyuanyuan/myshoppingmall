<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCartStore } from '@/stores/cartStore.js'
import { submitPayment, getPaymentStatus } from '@/apis/checkout.js'
import { get } from '@vueuse/core'

const router = useRouter()
const route = useRoute()
const payMethod = ref('alipay') // 默认支付宝支付

// 生成随机标识字符串
const generatePaymentId = () => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 8)
  return `PAY${timestamp}${random}`
}

// 支付标识字符串
const paymentId = ref(generatePaymentId())

// 从本地存储获取支付金额和购物车信息
const totalAmount = ref(0)
const cartInfo = ref(null)

onMounted(() => {
  const storedCartInfo = JSON.parse(localStorage.getItem('cartInfo') || '{}')
  console.log('从localStorage获取的购物车信息:', storedCartInfo)
  cartInfo.value = storedCartInfo
  if (storedCartInfo.summary) {
    totalAmount.value = storedCartInfo.summary.totalPayPrice
  }else{
    totalAmount.value = storedCartInfo.totalAmount
    console.log(totalAmount.value,"totalAmount")
  }
  
  // 检查购物车信息是否完整
  if (!storedCartInfo.cartId) {
    console.error('购物车信息不完整，缺少cartId:', storedCartInfo)
    ElMessage.error('购物车信息不完整，请重新选择商品')
    router.push('/cart')
  }
})

// 支付方式列表
const payMethods = [
  { 
    id: 'alipay', 
    name: 'Alipay',
    icon: '/src/assets/images/alipay.svg',
    qrcode: '/src/assets/images/alipay_qrcode.jpg'
  },
  { 
    id: 'wechat', 
    name: 'Wechat',
    icon: '/src/assets/images/wechat.svg',
    qrcode: '/src/assets/images/wechat_qrcode.jpg'
  },
  { 
    id: 'card', 
    name: 'card',
    icon: '/src/assets/images/card.svg'
  }
]

// 银行卡表单数据
const cardForm = ref({
  cardNumber: '',
  cardHolder: '',
  expiryDate: '',
  cvv: ''
})

// 表单验证规则
const rules = {
  cardNumber: [
    { required: true, message: 'Please enter your bank card number', trigger: 'blur' },
    { pattern: /^\d{16,19}$/, message: 'Please enter the correct card number', trigger: 'blur' }
  ],
  cardHolder: [
    { required: true, message: 'Please enter the cardholder\'s name', trigger: 'blur' }
  ],
  expiryDate: [
    { required: true, message: 'Please enter an expiration date', trigger: 'blur' },
    { pattern: /^(0[1-9]|1[0-2])\/([0-9]{2})$/, message: 'Please enter the correct expiration format(MM/YY)', trigger: 'blur' }
  ],
  cvv: [
    { required: true, message: 'Please enter the CVV code', trigger: 'blur' },
    { pattern: /^\d{3,4}$/, message: 'Please enter the correct CVV code', trigger: 'blur' }
  ]
}

const formRef = ref(null)

// 选择支付方式
const selectPayMethod = (method) => {
  payMethod.value = method
  // 切换支付方式时重新生成标识字符串
  paymentId.value = generatePaymentId()
}

// 确认支付
const confirmPay = async () => {
  const cartStore = useCartStore()
  console.log('当前购物车信息:', cartInfo.value)

  // 检查购物车信息
  if (!cartInfo.value || !cartInfo.value.cartId) {
    console.error('提交订单时购物车信息不完整:', cartInfo.value)
    ElMessage.error('订单信息不完整，请重新选择商品')
    router.push('/cart')
    return
  }

  if (payMethod.value === 'card') {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      await processPayment(cartStore)
    } catch (error) {
      console.error('支付失败:', error)
      ElMessage.error('请检查银行卡信息是否正确')
    }
  } else {
    try {
      await processPayment(cartStore)
    } catch (error) {
      console.error('支付失败:', error)
      ElMessage.error('支付失败，请重试')
    }
  }
}

const processPayment = async (cartStore) => {
  try {
    const orderId = get(cartInfo.value, 'orderId')
    if (!orderId) {
      console.error('订单ID不存在，无法更新订单状态')
      ElMessage.error('订单信息不完整，请重新提交订单')
      router.push('/cart')
      return
    }

    // 1. 提交支付请求
    const html =  await submitPayment(orderId)
    ElMessage.success('load...')

    // 创建一个新的标签页，html为支付页面的HTML内容
    const newTab = window.open('', '_blank')
    if (newTab) {
      newTab.document.writeln(html)
      newTab.document.close()
    } else {
      ElMessage.error('Unable to open payment page, please check your browser settings')
      return
    }


    // 2. 轮询查询支付状态
    const checkStatus = async () => {
      try {
        const response = await getPaymentStatus(orderId)
        if (response.status === 'success') {
          ElMessage.success('Success')
          await handleSuccessfulPayment(cartStore)
          router.push('/member/order')
        } else {
          setTimeout(checkStatus, 3000) // 3秒后再次检查
        }
      } catch (error) {
        console.error('查询支付状态失败:', error)
        ElMessage.error('支付状态查询失败，请重试')
      }
    }
    checkStatus()
  } catch (error) {
    console.error('支付失败:', error)
    ElMessage.error('支付失败，请重试')
  }
}

// 支付成功后的处理函数
const handleSuccessfulPayment = async (cartStore) => {
  try {
    // 1. 获取选中的商品（准备移除）
    const selectedGoods = cartStore.cartList.filter(item => item.selected)
    if (selectedGoods.length === 0) {
      console.warn('The payment was successful, but the item that needs to be removed is not selected')
      return
    }

    // 2. 检查订单ID
    const orderId = get(cartInfo.value, 'orderId')
    console.log('订单ID:', orderId)
    if (!orderId) {
      console.error('订单ID不存在，无法更新订单状态')
      ElMessage.error('订单信息不完整，请重新提交订单')
      router.push('/cart')
      return
    }
    
    // 5. 清除本地存储的购物车信息
    localStorage.removeItem('cartInfo')
    
  } catch (error) {
    console.error('支付处理失败:', error)
    ElMessage.error('订单处理失败，请重试')
  }
}
</script>

<template>
  <div class="payment-page">
    <div class="container">
      <div class="wrapper">
        <div class="payment-amount">
          <span class="amount-label">Payment Amount:</span>
          <!-- <span class="amount-value">¥{{ totalAmount.toFixed(2) }}</span> -->
        </div>
        <h3 class="box-title">Select a payment method</h3>

        <div class="box-body">
          <div class="pay-methods">
            <div 
              v-for="method in payMethods" 
              :key="method.id"
              class="pay-method-item"
              :class="{ active: payMethod === method.id }"
              @click="selectPayMethod(method.id)"
            >
              <img :src="method.icon" :alt="method.name" class="pay-icon">
              <span>{{ method.name }}</span>
            </div>
          </div>

          <!-- 支付二维码区域 -->
          <div class="qrcode-container" v-if="payMethod === 'alipay' || payMethod === 'wechat'">
            <div class="qrcode-box">
              <img 
                :src="payMethods.find(m => m.id === payMethod)?.qrcode" 
                :alt="payMethods.find(m => m.id === payMethod)?.name"
                class="qrcode-img"
              >

              <p class="qrcode-tip">Please use{{ payMethod === 'alipay' ? 'Alipay' : 'WeChat' }}Scan the QR code to pay</p>
              
              <!-- 支付标识字符串 -->
              <div class="payment-id-box">
                <p class="payment-id-label">Payment Identifier:</p>
                <p class="payment-id">{{ paymentId }}</p>
                <p class="payment-id-tip">Please note this payment identifier when making a transfer</p>
                <p class="payment-id-tip">（The logo contains: payment date and time + 4 letters）</p>
              </div>
            </div>
          </div>

          <!-- 银行卡信息输入区域 -->
          <div class="card-form-container" v-if="payMethod === 'card'">
            <el-form
              ref="formRef"
              :model="cardForm"
              :rules="rules"
              label-width="120px"
              class="card-form"
            >
              <el-form-item label="cardNumber" prop="cardNumber">
                <el-input v-model="cardForm.cardNumber" placeholder="Please enter your bank card number" />
              </el-form-item>
              <el-form-item label="cardHolder" prop="cardHolder">
                <el-input v-model="cardForm.cardHolder" placeholder="Please enter the cardholder's name" />
              </el-form-item>
              <el-form-item label="expiryDate" prop="expiryDate">
                <el-input v-model="cardForm.expiryDate" placeholder="Please enter an expiration date(MM/YY)" />
              </el-form-item>
              <el-form-item label="CVV" prop="cvv">
                <el-input v-model="cardForm.cvv" placeholder="Please enter the CVV code" />
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="submit">
          <el-button size="large" style="background-color: #ff66b3;color: white" @click="confirmPay">Confirm the payment</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.payment-page {
  margin-top: 20px;

  .wrapper {
    background: #fff;
    padding: 20px;

    .payment-amount {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #f5f5f5;
      margin-bottom: 20px;

      .amount-label {
        font-size: 16px;
        color: #666;
        margin-right: 10px;
      }

      .amount-value {
        font-size: 24px;
        color: #ff66b3;
        font-weight: bold;
      }
    }

    .box-title {
      font-size: 16px;
      font-weight: normal;
      padding-left: 10px;
      line-height: 70px;
      border-bottom: 1px solid #f5f5f5;
    }

    .box-body {
      padding: 20px 0;
    }

    .pay-methods {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;

      .pay-method-item {
        flex: 1;
        height: 100px;
        border: 1px solid #e4e4e4;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: #ff66b3;
        }

        &.active {
          border-color: #ff66b3;
          background-color: #fff5f8;
        }

        .pay-icon {
          width: 40px;
          height: 40px;
          margin-bottom: 10px;
        }

        span {
          font-size: 14px;
        }
      }
    }

    .qrcode-container {
      display: flex;
      justify-content: center;
      margin-top: 30px;

      .qrcode-box {
        text-align: center;
        padding: 20px;
        border: 1px solid #e4e4e4;
        border-radius: 4px;

        .qrcode-img {
          width: 200px;
          height: 200px;
          margin-bottom: 15px;
        }

        .qrcode-tip {
          color: #666;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .payment-id-box {
          background-color: #f8f8f8;
          padding: 15px;
          border-radius: 4px;
          margin-top: 20px;

          .payment-id-label {
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
          }

          .payment-id {
            color: #ff66b3;
            font-size: 18px;
            font-weight: bold;
            margin: 10px 0;
            font-family: monospace;
          }

          .payment-id-tip {
            color: #999;
            font-size: 12px;
            margin: 0;
          }
        }
      }
    }

    .card-form-container {
      display: flex;
      justify-content: center;
      margin-top: 30px;

      .card-form {
        width: 500px;
        padding: 20px;
        border: 1px solid #e4e4e4;
        border-radius: 4px;
      }
    }

    .submit {
      text-align: right;
      padding: 20px 0;
      border-top: 1px solid #f5f5f5;
    }
  }
}

.payment-id {
  margin-top: 15px;
  text-align: center;

  .label {
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
  }

  .value {
    font-size: 18px;
    color: #ff66b3;
    font-weight: bold;
    font-family: monospace; // 使用等宽字体，便于阅读
    margin-bottom: 10px;
  }

  .tip {
    font-size: 12px;
    color: #999;
    margin: 5px 0;
  }
}
</style> 