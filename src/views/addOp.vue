<template>
  <div class="add-op">
    <!-- 搜索框 -->
    <div class="form-box">
      <input
          v-model="keyword"
          type="text"
          placeholder="输入地点名称"
      />
      <button @click="searchPlace">
        搜索
      </button>
      <!-- 坐标显示 -->
      <div>
        <p>经度：{{ lng }}</p>
        <p>纬度：{{ lat }}</p>
        <button @click="copyCoords">
          📋 复制坐标
        </button>
      </div>
    </div>

    <!-- 地图容器 -->
    <div id="map" class="flex-1"></div>



  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";

const lng = ref(null);
const lat = ref(null);
const keyword = ref("");
let map = null;
let marker = null;
let placeSearch = null;

onMounted(async () => {
  const AMap = await AMapLoader.load({
    key: "59150528064ab34d7adab064a5bd28f9",
    version: "2.0",
    plugins: ["AMap.PlaceSearch"], // 引入搜索插件
  });

  map = new AMap.Map("map", {
    zoom: 5,
    center: [116.397428, 39.90923], // 默认北京
  });
  const Satellite = new AMap.TileLayer.Satellite()
  map.add(Satellite);
  marker = new AMap.Marker({
    position: map.getCenter(),
    draggable: true,
  });
  map.add(marker);

  // 点击地图拾取坐标
  map.on("click", (e) => {
    lng.value = e.lnglat.getLng();
    lat.value = e.lnglat.getLat();
    marker.setPosition([lng.value, lat.value]);
  });

  // 拖动标记拾取坐标
  marker.on("dragend", (e) => {
    lng.value = e.lnglat.getLng();
    lat.value = e.lnglat.getLat();
  });

  // 初始化搜索服务
  placeSearch = new AMap.PlaceSearch({ map });
});

// 搜索地点
const searchPlace = () => {
  if (!keyword.value.trim()) return;
  placeSearch.search(keyword.value, (status, result) => {
    if (status === "complete" && result.poiList && result.poiList.pois.length) {
      const poi = result.poiList.pois[0];
      const position = poi.location;
      lng.value = position.lng;
      lat.value = position.lat;
      map.setCenter(position);
      marker.setPosition(position);
    }
  });
};

// 复制坐标
const copyCoords = async () => {
  if (!lng.value || !lat.value) return;
  const text = `lng:${lng.value},lat:${lat.value}`;
  try {
    await navigator.clipboard.writeText(text);
    alert("已复制: " + text);
  } catch (err) {
    alert("复制失败");
  }
};
</script>

<style>
.add-op{
  width: 100%;
  height: 100%;
  position: relative;
}
#map {
  width: 100%;
  height: 100%;
}
.form-box{
  position: absolute;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.5);
  padding: 5px;
}
input{
  padding: 3px 5px;
  margin-right: 10px;
}
button{
  padding: 2px 5px;
}
</style>
