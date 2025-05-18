<script setup>
import { getProductById } from "@/apis/detail.js";
import { ref, onMounted } from 'vue';
import { useRoute } from "vue-router";

const goods = ref({})        // 改为对象
const route = useRoute()
const imageList = ref([])

const getGoods = async () => {
  try {
    const res = await getProductById(route.params.id)
    console.log("res",res)
    goods.value = res
    console.log("Product details", goods.value)
    // mainPictures
    imageList.value = goods.value.mainPictures
  } catch (error) {
    console.error("Fetch store details failed", error)
  }
}

onMounted(() => {
  getGoods()
})
</script>



<template>
  <div class="home-banner" v-if="imageList.length > 0">
    <el-carousel height="500px" trigger="click" indicator-position="outside">
      <el-carousel-item v-for="img in imageList" :key="img">
        <img :src="img" alt="banner" />
      </el-carousel-item>
    </el-carousel>
  </div>
</template>


<style scoped lang="scss">
.home-banner {
  width: 500px;
  height: 500px;
  position: relative;
  border-radius: 16px; // 圆角矩形
  box-sizing: border-box; // 让宽高包含 padding，避免撑开

  img {
    width: 100%;
    height: 100%;
    object-fit: cover; // 保证图片铺满不变形
  }
}
</style>