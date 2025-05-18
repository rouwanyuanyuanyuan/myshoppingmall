<script setup>
import { useCartStore } from "@/stores/cartStore";
import { ElMessage } from "element-plus";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";


const cartStore = useCartStore();
const router = useRouter();

//const { cartList } = storeToRefs(cartStore);
const { getCart, updateQuantity, delCart } = cartStore;

const singleCheck = (productId, selected) => {
  const item = cartStore.cartList.find((item) => item.productId === productId);
  if (item) {
    item.selected = selected;
  }
};

const allCheck = (selected) => {
  cartStore.allCheck(selected);
};

// 下单结算
const checkout = () => {
  // 保存选中的商品信息到本地存储
  const selectedGoods = cartStore.cartList.filter((item) => item.selected);
  if (selectedGoods.length === 0) {
    ElMessage.warning("Please select the product you want to check");

    return;
  }

  // 计算商品总价和应付总额
  console.log(selectedGoods,"selected");
  const totalPrice = selectedGoods.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const postFee = 10; // 运费
  const totalPayPrice = totalPrice + postFee;

  // 将选中的商品信息和金额信息保存到本地存储
  localStorage.setItem(
    "cartInfo",
    JSON.stringify({
      goods: selectedGoods.map((item) => ({
        id: item.id,
        name: item.name,
        picture: item.picture,
        price: item.price,
        quantity: item.quantity,
        attrsText: item.attrsText,
      })),
      summary: {
        goodsCount: selectedGoods.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: totalPrice,
        // postFee: postFee,
        totalPayPrice: totalPayPrice,
      },
    })
  );

  // 跳转到结算页面
  router.push("/checkout");
};

const onChange = (item) => {
  const { itemId, quantity } = item;
  console.log(item,"item")
  console.log(itemId,"itemid");
  updateQuantity(itemId, quantity);//注意
};

onMounted(() => {
  getCart();
});
</script>

<template>
  <div class="xtx-cart-page">
    <div class="container m-top-20">
      <div class="cart">
        <table>
          <thead>
            <tr>
              <th style="width: 120px">
                <el-checkbox
                  :model-value="cartStore.isAll"
                  @change="allCheck"
                />
              </th>

              <th style="width: 400px">Product name</th>
              <th style="width: 220px">unit price</th>
              <th style="width: 180px">quantity</th>
              <th style="width: 180px">total</th>
              <th style="width: 140px">operation</th>
            </tr>
          </thead>
          <!-- 商品列表 -->
          <tbody>
            <tr v-for="i in cartStore.cartList" :key="i.id">
              <td>
                <!-- 单选框 -->
                <el-checkbox
                  :model-value="i.selected"
                  @change="(selected) => singleCheck(i.productId, selected)"
                />
              </td>
              <td>
                <div class="goods">
                  <RouterLink to="/"
                    ><img :src="i.picture" alt=""
                  /></RouterLink>
                  <div>
                    <p class="name ellipsis">
                      {{ i.name }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="tc">
                <p>&yen;{{ i.price.toFixed(2) }}</p>
              </td>
              <td class="tc">
                <el-input-number
                  @change="onChange(i)"
                  v-model="i.quantity"
                  :min="1"
                />
              </td>
              <td class="tc">
                <p class="f16 red">
                  &yen;{{ (i.price * i.quantity).toFixed(2) }}
                </p>
              </td>
              <td class="tc">
                <p>
                  <el-popconfirm
                    title="Do you confirm the deletion?"
                    confirm-button-text="yes"
                    cancel-button-text="no"
                    @confirm="delCart(i.itemId)"
                  >
                    <template #reference>
                      <a >delete</a>
                    </template>
                  </el-popconfirm>
                </p>
              </td>
            </tr>
            <tr v-if="cartStore.cartList.length === 0">
              <td colspan="6">
                <div class="cart-none">
                  <el-empty description="The cart list is empty">
                    <el-button
                      style="background-color: #ff66b3; color: white"
                      @click="$router.push('/')"
                      >Feel free to take a look</el-button
                    >
                  </el-empty>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 操作栏 -->
      <div class="action">
        <div class="batch">
          Total {{ cartStore.allCount }} products,
          {{ cartStore.selectedCount }} selected, total:
          <span class="red">¥ {{ cartStore.selectedPrice.toFixed(2) }} </span>
        </div>
        <div class="total">
          <el-button
            size="large"
            style="background-color: #ff66b3; color: white"
            @click="checkout"
            >Purchase</el-button
          >
        </div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.xtx-cart-page {
  margin-top: 20px;

  .cart {
    background: #fff;
    color: #666;

    table {
      border-spacing: 0;
      border-collapse: collapse;
      line-height: 24px;

      th,
      td {
        padding: 10px;
        border-bottom: 1px solid #f5f5f5;

        &:first-child {
          text-align: left;
          padding-left: 30px;
          color: #999;
        }
      }

      th {
        font-size: 16px;
        font-weight: normal;
        line-height: 50px;
      }
    }
  }

  .cart-none {
    text-align: center;
    padding: 120px 0;
    background: #fff;

    p {
      color: #999;
      padding: 20px 0;
    }
  }

  .tc {
    text-align: center;

    a {
      color: $xtxColor;
    }

    .xtx-numbox {
      margin: 0 auto;
      width: 120px;
    }
  }

  .red {
    color: $priceColor;
  }

  .green {
    color: $xtxColor;
  }

  .f16 {
    font-size: 16px;
  }

  .goods {
    display: flex;
    align-items: center;

    img {
      width: 100px;
      height: 100px;
    }

    > div {
      width: 280px;
      font-size: 16px;
      padding-left: 10px;

      .attr {
        font-size: 14px;
        color: #999;
      }
    }
  }

  .action {
    display: flex;
    background: #fff;
    margin-top: 20px;
    height: 80px;
    align-items: center;
    font-size: 16px;
    justify-content: space-between;
    padding: 0 30px;

    .xtx-checkbox {
      color: #999;
    }

    .batch {
      a {
        margin-left: 20px;
      }
    }

    .red {
      font-size: 18px;
      margin-right: 20px;
      font-weight: bold;
    }
  }

  .tit {
    color: #666;
    font-size: 16px;
    font-weight: normal;
    line-height: 50px;
  }
}
</style>
