<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getproductsList,
  deleteProducts,
  reviseProducts,
  addProducts,
  uploadImageAPI,
  createPromotion
} from '@/apis/business.js'
import ProductTable from '../components/components/ProductTable.vue'
import ProductFormDialog from '../components/components/ProductFormDialog.vue'
import PromotionDialog from '../components/components/PromotionDialog.vue'
import dayjs from 'dayjs'
import ProductComment from '../components/components/ProductComment.vue'

// 商品数据相关
const products = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 商品表单相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const productId = ref(0)
const productForm = ref({
  name: '',
  description: '',
  price: '',
  stock: '',
  image: ''
})

// 促销表单相关
const promotionDialogVisible = ref(false)
const selectedProductId = ref('')
const promotionForm = ref({
  productIds: [],
  discountRate: 10,
  startDate: '',
  endDate: ''
})
const loading = ref(false)

// 获取商品数据
const getproducts = async () => {
  const res = await getproductsList({ page: currentPage.value, pageSize: pageSize.value })
  products.value = res.products
  total.value = res.total
}

onMounted(getproducts)

// 商品操作
const handleEdit = (row) => {
  dialogType.value = 'edit'
  productForm.value = { ...row }
  productId.value = row.productId
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('Are you sure you want to delete the item?', 'prompt', {
    confirmButtonText: 'yes',
    cancelButtonText: 'no',
    type: 'warning',
  }).then(async () => {
    await deleteProducts(row.productId)
    ElMessage.success('Deleted successfully')
    await getproducts()
  })
}

const handleAdd = () => {
  dialogType.value = 'add'
  productForm.value = {
    name: '',
    description: '',
    price: '',
    stock: '',
    image: ''
  }
  dialogVisible.value = true
}

// 图片上传
const handleImageUpload = async ({ file, productId }) => {
  if (!file) {
    console.error("Error: No file provided!")
    ElMessage.error("No file selected")
    return
  }

  const formData = new FormData()
  formData.append('image', file)

  try {
    const res = await uploadImageAPI(productId, formData)
    console.log(res,"image");
    if (res.imagePath) {
      // 更新对应商品的图片
      const product = products.value.find(p => p.productId === productId)
      if (product) {
        product.image = res.imagePath
        console.log(product,"product")
      }
      ElMessage.success('Image uploaded successfully')
    } else {
      throw new Error("No imagePath in response")
    }
  } catch (error) {
    console.error("Upload failed:", error)
    ElMessage.error('Image upload failed')
  }
}

// 提交商品表单
const handleSubmit = async () => {
  try {
    if (dialogType.value === 'add') {
      await addProducts(productForm.value)
      ElMessage.success('Added successfully')
    } else {
      await reviseProducts(productForm.value, productId.value)
      ElMessage.success('Updated successfully')
    }
    dialogVisible.value = false
    await getproducts()
  } catch (error) {
    ElMessage.error('Operation failed')
  }
}

// 促销操作
const showBatchPromotionDialog = () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning("No products selected")
    return
  }

  promotionForm.value = {
    productIds: [...selectedProducts.value],
    discountRate: 10,
    startDate: '',
    endDate: ''
  }
  promotionDialogVisible.value = true
}


const handleCreatePromotion = async () => {
  try {
    if (!promotionForm.value.discountRate ||
        !promotionForm.value.startDate ||
        !promotionForm.value.endDate) {
      ElMessage.warning('Please fill all fields')
      return
    }

    if (promotionForm.value.discountRate < 0.01 || promotionForm.value.discountRate > 99.99) {
      ElMessage.warning('Discount rate must be between 0.01% and 99.99%')
      return
    }

    if (new Date(promotionForm.value.endDate) <= new Date(promotionForm.value.startDate)) {
      ElMessage.warning('End date must be after start date')
      return
    }

    loading.value = true

    await createPromotion({
      productIds: promotionForm.value.productIds,
      discountRate: promotionForm.value.discountRate,
      startDate: dayjs(promotionForm.value.startDate).format('YYYY-MM-DD HH:mm'),
      endDate: dayjs(promotionForm.value.endDate).format('YYYY-MM-DD HH:mm')
    })

    ElMessage.success('Promotion created successfully!')
    promotionDialogVisible.value = false
  } catch (error) {
    console.error('Failed to create promotion:', error)
    ElMessage.error(error.response?.data?.message || 'Failed to create promotion')
  } finally {
    loading.value = false
  }
}

const selectedProducts = ref([])
const handleSelectionChange = (rows) => {
  selectedProducts.value = rows.map(item => item.productId)
}

const selectedProductIdForComments = ref('')
const showComments = (productId) => {
  console.log(productId,"tablepro")
  selectedProductIdForComments.value = productId.productId
}
</script>

<template>
  <div class="management-container">
    <div class="header">
      <div class="title-row">
        <h2 class="title">Product Management</h2>
        <div class="button-group">
          <el-button
              class="pink-button"
              @click="handleAdd"
          >
            Add product
          </el-button>
          <el-button
              class="pink-button warning"
              :disabled="selectedProducts.length === 0"
              @click="showBatchPromotionDialog"
          >
            Create Promotion
          </el-button>
        </div>
      </div>

      <ProductTable
          :products="products"
          @edit="handleEdit"
          @delete="handleDelete"
          @promotion="showBatchPromotionDialog"
          @upload="handleImageUpload"
          @select-multiple="handleSelectionChange"
          @row-click="showComments"
      />
    </div>

    <ProductFormDialog
        :visible="dialogVisible"
        :type="dialogType"
        :form="productForm"
        @update:visible="val => dialogVisible = val"
        @submit="handleSubmit"
    />

    <PromotionDialog
        :visible="promotionDialogVisible"
        :form="promotionForm"
        :loading="loading"
        @update:visible="val => promotionDialogVisible = val"
        @create="handleCreatePromotion"
    />

    <ProductComment
        :productId="selectedProductIdForComments"
        v-if="selectedProductIdForComments"
        class="comment-section"
    />

  </div>
</template>

<style scoped lang="scss">
.management-container {
  padding: 24px;
  background-color: #fff5f7;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 24px;

  .title {
    color: #e23d7d;
    margin: 0;
    font-weight: 600;
    font-size: 24px;
  }
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .button-group {
    display: flex;
    gap: 12px;
  }
}

.pink-button {
  background-color: #ff85a2;
  border-color: #ff85a2;
  color: white;

  &:hover {
    background-color: #ff6b8b;
    border-color: #ff6b8b;
  }

  &:active {
    background-color: #e23d7d;
    border-color: #e23d7d;
  }

  &.warning {
    background-color: #ff6b8b;
    border-color: #ff6b8b;

    &:hover {
      background-color: #e23d7d;
      border-color: #e23d7d;
    }

    &:disabled {
      background-color: #ffc0cb;
      border-color: #ffc0cb;
    }
  }
}
.comment-section {
  margin-top: 30px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>