<script setup>
import {ref, onMounted} from "vue";
import {useRoute} from "vue-router";
import {getProductById} from "@/apis/detail.js";
import ImageView from "@/components/imageView/index.vue";

//import { picture } from '@element-plus/icons-vue/dist/types'
import Evaluate from "@/views/Detail/evaluate.vue";

import {useCartStore} from "@/stores/cartStore";
import {usePromotionInfoStore} from '@/stores/promotionInfoStore';
import {getPromotionByProductId} from '@/apis/promotionInfo.js';
import {Star, StarFilled} from "@element-plus/icons-vue";
import {useCollectionStore} from "@/stores/collectionStore.js";

const promotionInfoStore = usePromotionInfoStore();
const cartStore = useCartStore();

const goods = ref({});
const promotionInfo = ref({});
const quantity = ref(1);
const route = useRoute();
const collectionStore = useCollectionStore();

const updateQuantity = (itemId, quantity) => {
  cartStore.updateCartItemQuantity(itemId, quantity);
};

const countChange = (quantity) => {
  console.log(quantity);
};

const addCart = () => {
  cartStore.addCart({
    itemId: goods.value.itemId,
    productId: goods.value.productId,
    name: goods.value.name,
    price: goods.value.price,
    quantity: quantity.value,
    selected: true,
  });
};

const getGoods = async () => {
  try {
    const res = await getProductById(route.params.id);
    goods.value = res;
    console.log(goods,"goods");
  } catch (error) {
    console.error("Fetch store details failed", error);
  }
};

const getPromotionInfo = async () => {
  try {
    const res = await getPromotionByProductId(route.params.id);
    promotionInfo.value = res;
    console.log(promotionInfo.value, "promotionInfo");
  } catch (error) {
    // 请求失败时静默处理，不触发全局弹窗
    console.error("Failed to fetch promotion info:", error);
    promotionInfo.value = null; // 也可以设成 {} 或其他默认值
  }
};


const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});
};

onMounted(() => {
  getGoods();
  getPromotionInfo();
});
</script>

<template>
  <div class="xtx-goods-page">
    <div class="container" v-if="goods">
      <div class="bread-container">
        <el-breadcrumb separator=">">
          <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
          <el-breadcrumb-item>{{ goods.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- Product Information -->
      <div class="info-container">
        <div class="goods-info">
          <div class="media">
            <ImageView />
          </div>

          <div class="spec">
            <h1 class="g-name">{{ goods.name }}</h1>
            <el-button
                    :icon="collectionStore.isCollected(goods.productId) ? StarFilled : Star"
                    circle
                    @click="collectionStore.toggleCollection(goods.productId)"
                    :loading="collectionStore.loading"
                    :type="collectionStore.isCollected(goods.productId) ? 'warning' : ''"
                    class="collect-btn"
            />
            <p class="g-desc">{{ goods.desc }}</p>
            
            <div class="price-section">
              <div class="g-price">
                <div v-if="promotionInfo" class="discounted-price">
                  <span class="price">￥{{ promotionInfo.currentPrice }}</span>
                  <span class="original-price">￥{{ promotionInfo.basePrice }}</span>
                </div>
                <div v-else>
                  <span class="price">${{ goods.price }}</span>
                </div>
                <span class="stock">Stock: {{ goods.stock }} items</span>
              </div>
            </div>

            <div class="seller-info">
              <h3 class="seller-title">Seller</h3>
              <div class="seller-details">
                <div class="seller-field">
                  <span class="label">Name:</span>
                  <span class="value">{{ goods.sellerName }}</span>
                </div>
                <div class="seller-field">
                  <span class="label">Email:</span>
                  <a :href="`mailto:${goods.sellerEmail}`" class="value">{{ goods.sellerEmail }}</a>
                </div>
              </div>
            </div>

            <div class="g-service">
              <dl>
                <dt>Promotion</dt>
                <dd>
                  <span v-if="promotionInfo" class="promotion-tag">
                    {{ promotionInfo.discountRate }}% Discount
                    <span class="valid-date">(Valid for {{ promotionInfo.validUntil }} more days)</span>
                  </span>
                  <span v-else class="no-promotion-tag">No current promotions</span>
                </dd>
              </dl>

              <dl>
                <dt>Services</dt>
                <dd>
                  <span class="service-tag">Free Returns</span>
                  <span class="service-tag">Fast Refund</span>
                  <span class="service-tag">Free Shipping</span>
                </dd>
              </dl>
            </div>

            <div class="action-section">
              <div class="quantity-selector">
                <span class="label">Quantity</span>
                <el-input-number
                    v-model="quantity"
                    :min="1"
                    :max="goods.stock"
                    size="large"
                    controls-position="right"
                />
              </div>

              <el-button
                  type="danger"
                  size="large"
                  class="add-cart-btn"
                  @click="addCart"
              >
                Add to Cart
              </el-button>
            </div>
          </div>
        </div>
      </div>


      <!-- 评价 -->
      <Evaluate />
    </div>
  </div>
</template>

<style scoped lang="scss">
.xtx-goods-page {
  padding-bottom: 40px;

  .bread-container {
    padding: 25px 0;
    max-width: 1200px;
    margin: 0 auto;
  }

  .info-container {
    max-width: 1200px;
    margin: 0 auto;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  .goods-info {
    display: flex;
    padding: 30px;

    .media {
      width: 480px;
      padding-right: 40px;
    }

    .spec {
      flex: 1;
      padding-left: 40px;
      border-left: 1px solid #f5f5f5;
    }
  }

  .g-name {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    line-height: 1.4;
  }

  .g-desc {
    color: #999;
    font-size: 14px;
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .price-section {
    display: flex;
    align-items: center;
    margin-bottom: 25px;

    .g-price {
      .discounted-price {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .price {
        font-size: 28px;
        color: deeppink;
        font-weight: 600;
        margin-right: 15px;
      }

      .original-price {
        font-size: 18px;
        color: #999;
        text-decoration: line-through;
      }

      .stock {
        color: #666;
        font-size: 14px;
        display: block;
        margin-top: 5px;
      }
    }

    .discount-badge {
      background: #fef0f0;
      color: deeppink;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 14px;
      margin-left: 15px;
      font-weight: 500;
    }
  }

  .seller-info {
    margin-bottom: 25px;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 6px;

    .seller-title {
      font-size: 16px;
      color: #333;
      margin-bottom: 15px;
      font-weight: 600;
    }

    .seller-details {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .seller-field {
      display: flex;
      align-items: center;

      .label {
        width: 60px;
        color: #666;
        font-size: 14px;
      }

      .value {
        color: #333;
        font-size: 14px;
      }

      a.value {
        color: #409eff;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .g-service {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 6px;
    margin-bottom: 30px;

    dl {
      display: flex;
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }

      dt {
        width: 80px;
        color: #666;
        font-weight: 500;
      }

      dd {
        flex: 1;
        color: #666;
      }
    }

    .promotion-tag {
      color: deeppink;
      font-weight: 500;

      .valid-date {
        color: #999;
        font-size: 12px;
        margin-left: 5px;
      }
    }

    .no-promotion-tag {
      color: #999;
    }

    .service-tag {
      display: inline-block;
      margin-right: 15px;
      position: relative;
      padding-left: 18px;

      &::before {
        content: "•";
        color: #67c23a;
        font-size: 18px;
        position: absolute;
        left: 0;
        top: -1px;
      }
    }
  }

  .action-section {
    .quantity-selector {
      display: flex;
      align-items: center;
      margin-bottom: 25px;

      .label {
        width: 80px;
        color: #666;
        font-size: 14px;
      }

      :deep(.el-input-number) {
        width: 120px;

        .el-input__inner {
          text-align: center;
        }
      }
    }

    .add-cart-btn {
      width: 200px;
      height: 50px;
      font-size: 16px;
      background: hotpink;
      border: none;

      &:hover {
        opacity: 0.9;
      }
    }
  }

  @media (max-width: 768px) {
    .goods-info {
      flex-direction: column;
      padding: 15px;

      .media {
        width: 100%;
        padding-right: 0;
        margin-bottom: 20px;
      }

      .spec {
        padding-left: 0;
        border-left: none;
      }
    }

    .action-section {
      .add-cart-btn {
        width: 100%;
      }
    }
  }
}

.btn {
  margin-top: 20px;
}

.number {
  margin-top: 15px;
}

.bread-container {
  padding: 25px 0;
}


</style>

