
<script setup>
defineProps({
  goods: {
    type: Object,
    default: () => { }
  }
})
</script>

<template>
  <RouterLink :to="{path: `/detail/${goods.productId}`}" class="goods-item">
      <img :src="goods.thumbnail" alt="" />
      <p class="name">{{ goods.name }}</p>
      <!--    <p class="desc">{{ goods.desc }}</p>-->
      <p class="price">&yen;{{ goods.price }}</p>
  </RouterLink>
</template>


<style scoped lang="scss">
.goods-item {
  display: block;
  width: 210px;
  height: 300px;
  padding: 5px 5px;
  text-align: center;
  transition: all .2s;
  background-color: #fff;
  border-radius: 16px; // 圆角矩形
  box-sizing: border-box; // 让宽高包含 padding，避免撑开
  //增加阴影
  box-shadow: 0 4px 8px rgba(192, 121, 155, 0.314);

  &:hover {
    transform: translate3d(0, -3px, 0);
    box-shadow: 0 3px 8px pink;
  }

  img {
    width: 170px;
    height: 160px;
    border-radius: 16px; // 圆角矩形
  }

  p {
    padding-top: 10px;
  }

  .name {
    font-size: 16px;
    height: 20%;
    display: -webkit-box;
    -webkit-line-clamp: 3; // 想展示几行自己定
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  //.desc {
  //  color: #999;
  //  height: 60px;
  //  display: -webkit-box;
  //  -webkit-line-clamp: 3; // 想展示几行自己定
  //  -webkit-box-orient: vertical;
  //  overflow: hidden;
  //}

  .price {
    height: 20%;
    color: $priceColor;
    font-size: 20px;
  }
}
</style>