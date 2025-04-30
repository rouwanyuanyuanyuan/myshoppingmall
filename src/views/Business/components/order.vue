<script setup>
import { onMounted, ref, computed } from 'vue'
import { useBusinessStore } from '@/stores/businessStore'
import { ElMessageBox, ElMessage } from 'element-plus'

const store = useBusinessStore()
const selectedStatus = ref('all')

// tab列表，状态与后端匹配
const tabTypes = [
  { name: "all", label: "All", color: "#9E9E9E" },
  { name: "pending", label: "Pending", color: "#FF8A65" },
  { name: "paid", label: "Paid", color: "#64B5F6" },
  { name: "shipping", label: "Shipping", color: "#4DB6AC" },
  { name: "finished", label: "Finished", color: "#81C784" },
  { name: "canceled", label: "Canceled", color: "#E57373" }
]

// 处理 tab 切换
const tabClick = (tabName) => {
  selectedStatus.value = tabName
}

const calculateTotal = (order) => {
  console.log(order, "order");
  if (!Array.isArray(order) || order.length === 0) return "0.00";
  return order
      .reduce((total, item) => total + (item.price * item.quantity), 0)
      .toFixed(2);
};




// 获取订单列表
const getOrders = async () => {
  try {
    await store.fetchSellerOrders()
  } catch (error) {
    ElMessage.error('获取订单失败')
  }
}

// 过滤后的订单列表
const filteredOrders = computed(() => {
  console.log(store.sellerOrders,"index")
  let orders = store.sellerOrders || []; // 兼容可能为空的情况
  if (selectedStatus.value !== 'all') {
    orders = orders.filter(order => order.status === selectedStatus.value);
  }
  // 规范化 items 结构，确保是数组
  return orders.map(order => ({
    ...order,
    items: order.items.items || [] // 确保 items 是数组
  }));
});


// 发货操作
const handleShipOrder = async (orderId) => {
  try {
    await ElMessageBox.prompt('Please input the trackingNumber', 'SHIP', {
      confirmButtonText: 'CONFIRM',
      cancelButtonText: 'CANCEL',
      inputPattern: /.+/,
      inputErrorMessage: 'TRACKINGNUMBER CAN NOT BE EMPTY!',
    }).then(async ({ value }) => {
      await store.shipOrder(orderId,  value)
      ElMessage.success('ORDER HAS BEEN SHIPPED!')
      getOrders()
    })
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || 'SHIPPING FAILED!')
    }
  }
}

// 取消订单
const handleCancelOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm(
        'DO YOU WANT TO CANCEL THE ORDER?',
        'YES',
        {
          confirmButtonText: 'YES',
          cancelButtonText: 'NO',
          type: 'warning',
        }
    )
    await store.cancelOrder(orderId)
    ElMessage.success('ORDER HAS BEEN CANCELED')
    getOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('CANCEL ORDER FAILED!')
    }
  }
}

// 组件加载时获取订单
onMounted(() => {
  getOrders()
})
</script>

<template>
  <div class="order-management">
    <div class="order-header">
      <h2 class="order-title">Order Mangement</h2>

      <el-tabs v-model="selectedStatus" @tab-change="tabClick" class="status-tabs">
        <el-tab-pane
            v-for="item in tabTypes"
            :key="item.name"
            :label="item.label"
            :name="item.name"
        >
          <template #label>
            <span class="tab-label" :style="{ color: item.color }">
              {{ item.label }}
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="order-list">
      <div v-for="order in filteredOrders" :key="order.orderId" class="order-card">
        <div class="order-summary">
          <div class="order-meta">
            <span class="order-number">Order #{{ order.orderId }}</span>
            <span class="customer-name">{{ order.userName }}</span>
          </div>

          <div class="order-status">
            <el-tag
                :color="tabTypes.find(t => t.name === order.status)?.color"
                effect="plain"
                class="status-badge"
            >
              {{ tabTypes.find(t => t.name === order.status)?.label }}
            </el-tag>
            <span class="order-amount">¥{{ calculateTotal(order.items) }}</span>
          </div>
        </div>

        <el-collapse>
          <el-collapse-item>
            <template #title>
              <span class="detail-toggle">Check</span>
            </template>

            <div class="order-details">
              <div class="product-list">
                <div v-for="item in order.items" :key="item.orderItemId" class="product-item">
                  <div class="product-info">
                    <span class="product-name">{{ item.productName }}</span>
                    <span class="product-quantity">×{{ item.quantity }}</span>
                  </div>
                  <span class="product-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              </div>

              <div class="shipping-info" v-if="order.city || order.address || order.postalCode">
                <h4 class="info-title">Shipping Information</h4>
                <div class="info-content">
                  <div class="info-row">
                    <span class="info-label">City:</span>
                    <span class="info-value">{{ order.city }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Address:</span>
                    <span class="info-value">{{ order.address }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Postal Code:</span>
                    <span class="info-value">{{ order.postalCode }}</span>
                  </div>
                  <div class="info-row" v-if="order.trackingNumber && (order.status === 'shipping' || order.status === 'finished')">
                    <span class="info-label">Tracking Number:</span>
                    <span class="info-value">{{ order.trackingNumber }}</span>
                  </div>
                </div>
              </div>

              <div class="action-buttons">

                <el-button
                    type="success"
                    size="small"
                    plain
                    v-if="order.status === 'paid'"
                    @click.stop="handleShipOrder(order.orderId)"
                >
                  Ship
                </el-button>


                <el-button
                    type="danger"
                    size="small"
                    plain
                    v-if="order.status === 'pending' || order.status === 'paid'"
                    @click.stop="handleCancelOrder(order.orderId)"
                >
                  Cancel
                </el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.order-management {
  padding: 20px;
  background-color: #fff5f7;
  min-height: 100%;
}

.order-header {
  margin-bottom: 24px;
  padding: 0 8px;
}

.order-title {
  color: #e23d7d;
  margin-bottom: 16px;
  font-size: 22px;
  font-weight: 600;
}

.status-tabs {
  :deep(.el-tabs__item) {
    padding: 0 16px;
    height: 40px;
    font-size: 14px;
  }

  :deep(.el-tabs__active-bar) {
    background-color: #e23d7d;
    height: 3px;
  }
}

.tab-label {
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background-color: #fce4ec;
  }
}

.order-list {
  display: grid;
  gap: 16px;

}

.order-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.order-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.order-meta {
  display: flex;
  align-items: center;
  gap: 16px;

  .order-number {
    font-weight: 600;
    color: #333;
  }

  .customer-name {
    color: #666;
    font-size: 14px;
  }
}

.order-status {
  display: flex;
  align-items: center;
  gap: 16px;

  .status-badge {
    border: none;
    color: white;
    font-weight: 500;
    padding: 4px 12px;
    border-radius: 12px;
  }

  .order-amount {
    font-weight: 600;
    color: #e23d7d;
    min-width: 80px;
    text-align: right;
  }
}

.detail-toggle {
  color: #e23d7d;
  font-size: 14px;
  padding-left: 16px;
  cursor: pointer;
}

.order-details {
  padding: 16px;
  background-color: #fff9fa;
}

.product-list {
  margin-bottom: 16px;
}

.shipping-info {
  margin: 20px 0;
  padding: 0;

  .info-title {
    color: #e23d7d;
    margin-bottom: 12px;
    font-size: 15px;
    font-weight: 600;
    padding-left: 8px;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 14px;
      background-color: #e23d7d;
      border-radius: 2px;
    }
  }

  .info-content {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 2px rgba(226, 61, 125, 0.1);
  }

  .info-row {
    display: flex;
    margin-bottom: 10px;
    align-items: flex-start;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .info-label {
    font-weight: 500;
    color: #e23d7d;
    margin-right: 12px;
    min-width: 120px;
    font-size: 14px;
    opacity: 0.8;
  }

  .info-value {
    color: #333;
    font-size: 14px;
    flex: 1;
    word-break: break-word;
    line-height: 1.5;
    padding-top: 1px; /* 微调对齐 */
  }
}


.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.product-info {
  flex: 1;

  .product-name {
    font-weight: 500;
    color: #333;
  }

  .product-quantity {
    color: #888;
    font-size: 13px;
    margin-left: 8px;
  }
}

.product-price {
  font-weight: 600;
  color: #e91e63;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
}

:deep(.el-button) {
  border-radius: 16px;
  padding: 8px 16px;
}
</style>