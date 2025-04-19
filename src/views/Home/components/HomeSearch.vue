<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchProducts } from '@/apis/searchProducts.js'
import Goodsitem from "@/views/Home/components/Goodsitem.vue"

const route = useRoute()

// 响应式数据
const keyword = ref(route.query.keyword || '')
const products = ref([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const sort = ref('')

// 请求搜索商品数据
const fetchProducts = async () => {
  if (!keyword.value) return
  try {
    const res = await searchProducts({
      keyword: keyword.value,
      page: page.value,
      limit: limit.value,
      sort: sort.value
    })
    products.value = res.results
    total.value = res.total
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

// 初始加载和监听路由变化
onMounted(fetchProducts)
watch(() => route.query.keyword, (newKeyword) => {
  keyword.value = newKeyword
  page.value = 1
  fetchProducts()
})
</script>

<template>
  <div class="search-results">
    <div class="header">
      <h3 v-if="products.length > 0" class="title">
        Results for: "{{ keyword }}"
        <small class="subtitle">We found {{ total }} items for you</small>
      </h3>
      <h3 v-else class="title">
        No results found for: "{{ keyword }}"
        <small class="subtitle">Please try another search term</small>
      </h3>
    </div>

    <div v-if="products.length > 0" class="product-list-container">
      <div class="product-list">
        <Goodsitem
            v-for="item in products"
            :key="item.id"
            :goods="item"
            class="product-item"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.search-results {
  background-color: #fff;
  padding: 40px 0;
  max-width: 1400px;
  margin: 0 auto;

  .header {
    padding: 0 40px 40px;

    .title {
      font-size: 32px;
      font-weight: normal;
      color: #c75c8a;
      margin-bottom: 10px;

      .subtitle {
        font-size: 16px;
        color: #ff9db5;
        margin-left: 20px;
      }
    }
  }

  .product-list-container {
    padding: 0 20px;

    .product-list {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 24px;
      justify-items: center;

      .product-item {
        width: 100%;
        max-width: 240px;
        transition: transform 0.3s ease;

        &:hover {
          transform: translateY(-5px);
        }
      }
    }
  }
}

@media (max-width: 1200px) {
  .product-list {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}

@media (max-width: 992px) {
  .product-list {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .product-list {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .header {
    padding: 0 20px 30px !important;

    .title {
      font-size: 28px !important;
    }
  }
}

@media (max-width: 480px) {
  .product-list {
    grid-template-columns: 1fr !important;
  }
}
</style>