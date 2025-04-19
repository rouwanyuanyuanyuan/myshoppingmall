<template>
  <div class="product-comments pink-theme">
    <el-table :data="reviews" style="width: 100%" v-loading="loading" class="pink-table">
      <el-table-column prop="reviewId" label="Review ID" width="220" />
      <el-table-column prop="rating" label="Rating" width="120">
        <template #default="{ row }">
          <el-rate v-model="row.rating" disabled show-score />
        </template>
      </el-table-column>
      <el-table-column prop="comment" label="Comment" />
      <el-table-column prop="createdAt" label="Date" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchComments"
        class="pink-pagination"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { getEvaluate } from '@/apis/detail.js';

const props = defineProps({
  productId: {
    type: String,
    required: true
  }
});

const reviews = ref([]);
const total = ref(0);
const loading = ref(false);

const pagination = ref({
  page: 1,
  limit: 10
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const fetchComments = async () => {
  try {
    loading.value = true;
    const response = await getEvaluate({
      productId: props.productId,
      page: pagination.value.page,
      limit: pagination.value.limit
    });
    reviews.value = response.reviews;
    total.value = response.total;
  } catch (error) {
    console.error('Error fetching comments:', error);
  } finally {
    loading.value = false;
  }
};

watch(() => props.productId, (newVal) => {
  if (newVal) {
    pagination.value.page = 1;
    fetchComments();
  }
}, {immediate: true});
</script>

<style scoped lang="scss">
.product-comments {
  padding: 10px;
}

/* 粉色主题样式 */
.pink-table {
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

  :deep(.el-rate) {
    --el-rate-fill-color: #f784a7;
  }
}

.pink-pagination {
  margin-top: 15px;
  justify-content: center;

  :deep(.btn-prev),
  :deep(.btn-next),
  :deep(.number) {
    &:hover {
      color: #e23d7d;
    }

    &.active {
      background-color: #f784a7;
      border-color: #f784a7;
      color: white;
    }
  }
}
</style>