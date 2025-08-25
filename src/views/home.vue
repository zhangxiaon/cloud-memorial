<template>
  <div class="home-box">
    <div class="op-add" @click="addOp">坐标拾取器</div>
    <Map></Map>
  </div>

</template>
<script setup>
import Map from '../components/Map.vue'
const addOp = () => {
  window.open('./#/addOp')
}
</script>
<style scoped>
.home-box{
  position: relative;
}
.op-add{
  position: absolute;
  left: 10px;
  top: 10px;
  padding: 3px 5px;
  color: #ccc;
  font-size: 16px;
  border: 1px solid #ccc;
  z-index: 1000;
  cursor: pointer;
}
</style>
