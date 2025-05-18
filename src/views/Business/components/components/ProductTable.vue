<template>
  <el-table :data="products"
            style="width: 100%"
            border class="pink-table"
            @selection-change="handleSelectionChange"
  >
    <el-table-column type="selection" width="55" />
    <el-table-column prop="productId" label="ID" width="300"></el-table-column>
    <el-table-column prop="name" label="Name" width="200"></el-table-column>
    <el-table-column prop="description" label="Description"></el-table-column>
    <el-table-column prop="price" label="Price" width="120" align="right"></el-table-column>
    <el-table-column prop="stock" label="Stock" width="120" align="center"></el-table-column>
    <el-table-column label="Operations" width="420" align="center">
      <template #default="scope">
        <div class="action-buttons">
          <el-button size="small" @click="emit('edit', scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="emit('delete', scope.row)">Delete</el-button>
          <el-button size="small" @click="showComments(scope.row.productId)">View Comments</el-button>
          <el-upload
              class="upload-demo"
              action=""
              :show-file-list="false"
              :http-request="(options) => emit('upload', { file: options.file, productId: scope.row.productId })"
              accept="image/*"
          >
            <el-button size="small">Upload Image</el-button>
          </el-upload>

        </div>
        <el-image
            v-if="scope.row.image"
            :src="scope.row.image"
            class="product-image"
        ></el-image>
      </template>
    </el-table-column>
  </el-table>
  <el-dialog v-model="commentDialogVisible" title="Product Comments" width="50%">
    <ProductComment v-if="commentDialogVisible" :product-id="selectedProductId" />
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue';
import ProductComment from '../components/ProductComment.vue';

defineProps({
  products: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete', 'promotion', 'upload', 'select-multiple']);

const commentDialogVisible = ref(false);
const selectedProductId = ref('');

const handleSelectionChange = (val) => {
  emit('select-multiple', val);
};

const showComments = (productId) => {
  selectedProductId.value = productId;
  commentDialogVisible.value = true;
};
</script>

<style scoped lang="scss">
.pink-table {
  width: 100%;

  :deep(.el-table__header) {
    background-color: #fce4ec;

    th {
      background-color: #fce4ec;
      color: #e23d7d;
      font-weight: 600;
    }
  }

  :deep(.el-table__row) {
    &:hover {
      background-color: #fff0f4 !important;
    }
  }

  :deep(.el-button) {
    background-color: #f784a7;
    border-color: #f784a7;
    color: white;
    margin: 4px;

    &:hover {
      background-color: #e23d7d;
      border-color: #e23d7d;
    }

    &.el-button--danger {
      background-color: #ff4081;
      border-color: #ff4081;

      &:hover {
        background-color: #f50057;
        border-color: #f50057;
      }
    }
  }
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.product-image {
  width: 100px;
  height: 100px;
  margin-top: 8px;
  border-radius: 4px;
  object-fit: cover;
}
</style>