<template>
  <div class="map-view">
    <div class="bing-map" @click="openBing" title="高德部分地区无卫星影像，如需查看，请科学上网使用 Bing 地图">打开Bing地图</div>
    <div id="map" style="width: 100%; height: 100vh"></div>
  </div>

</template>

<script setup>
import { onMounted } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import { useRoute } from "vue-router";

const route = useRoute();
let grave = window.localStorage.getItem("grave")
grave = grave ? JSON.parse(grave) : {}
const lng = parseFloat(grave.lng);
const lat = parseFloat(grave.lat);
const title = grave.title;

onMounted(async () => {
  const AMap = await AMapLoader.load({
    key: "59150528064ab34d7adab064a5bd28f9",
    version: "2.0",
    plugins: ["AMap.Scale", "AMap.ToolBar"],
  });

  const map = new AMap.Map("map", {
    zoom: 15,
    center: [lng, lat]
  });
  const Satellite = new AMap.TileLayer.Satellite()
  map.add(Satellite);
  const marker = new AMap.Marker({
    position: [grave.lng, grave.lat],
    map,
    content: grave.photo ? `<img class="marker-icon" src="${grave.photo}" />` : "",
    anchor: 'bottom-center',
    title: grave.title,
  });
  // 点击显示 InfoWindow
  marker.on("click", () => {
    const content = `
        <div class="tombstone-3d">
          <div class="tomb-top">
          <img src="${grave.photo}" alt="">
</div>
          <div class="tomb-body">
            <div class="tomb-header">${grave.title}</div>
            <div class="tomb-text">${grave.bio}</div>
          </div>
          <div class="tomb-base"></div>
        </div>
      `;

    const infoWindow = new AMap.InfoWindow({
      content,
      offset: new AMap.Pixel(0, -30),
      isCustom: true // 开启自定义样式
    });
    infoWindow.open(map, [grave.lng, grave.lat]);
    // 延迟绑定事件，确保 InfoWindow 渲染完成
    setTimeout(() => {
      const textEl = document.querySelector('.tomb-text');
      if (textEl) {
        textEl.addEventListener('wheel', e => e.stopPropagation());
      }
    }, 100);
  });
});
const openBing = () => {
  window.open(`https://www.bing.com/maps?cp=${lat}~${lng}&lvl=18&style=a`)
}
</script>
<style>
.map-view {
  position: relative;
}
.bing-map {
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

.marker-icon {
  width: 26px;
  height: 35px;
  object-fit: cover; /* 保持图片比例裁剪 */
  mask-image: url('https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png');
  mask-repeat: no-repeat;
  mask-size: cover;
}

.tombstone-3d {
  width: 220px;
  font-family: "Georgia", serif;
  position: relative;
  text-align: center;
  perspective: 600px; /* 透视增强立体感 */
  transform-style: preserve-3d;
}

/* 顶部拱形 */
.tomb-top {
  width: 120px;
  height: 60px;
  margin: 0 auto;
  border-radius: 60px 60px 0 0;
  border: 2px solid #666;
  box-shadow: inset -2px -2px 6px rgba(0,0,0,0.2), 2px 2px 8px rgba(0,0,0,0.3);
  transform: rotateX(5deg); /* 微微倾斜 */
  background-image: url('../assets/bg.jpg'); /* 石纹纹理 */
  background-size: cover;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tomb-top img{
  height: 50%;
  margin-top: 10px;
}

/* 主体 */
.tomb-body {
  width: 120px;
  margin: 0 auto;
  background: linear-gradient(145deg, #eee 0%, #ccc 100%);
  border: 2px solid #666;
  border-radius: 0 0 10px 10px;
  padding: 5px 0;
  margin-top: -2px;
  box-shadow: inset -2px -2px 6px rgba(0,0,0,0.2), 2px 2px 8px rgba(0,0,0,0.3);
  transform: rotateX(2deg); /* 轻微倾斜增加立体感 */
  background-image: url('../assets/bg.jpg'); /* 石纹纹理 */
  background-size: cover;
  box-sizing: border-box;
}

/* 标题 */
.tomb-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 6px;
  color: #ccc;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
}

/* 文字内容 */
.tomb-text {
  writing-mode: vertical-rl;   /* 从右向左竖排 */
  text-orientation: upright;   /* 保持每个字直立 */
  line-height: 1.4em;          /* 调整行间距，模拟刻字效果 */
  font-family: "SimSun", "Georgia", serif; /* 模拟碑文字体 */
  font-size: 14px;
  color: #ccc;
  width: 100%;
  height: 110px;
  text-align: start;
  overflow-x: auto;
  margin-bottom: 8px;
}
.tomb-text img{
  height: 100%;
  width: auto;
}


/* 底座 */
.tomb-base {
  width: 140px;
  height: 12px;
  background: #999;
  margin: 0 auto;
  border-radius: 4px;
  box-shadow: inset -2px -2px 4px rgba(0,0,0,0.3),
  2px 2px 6px rgba(0,0,0,0.3);
  transform: rotateX(-1deg);
  background-image: url('../assets/bg.jpg'); /* 石纹纹理 */
  background-size: cover;
}



</style>
