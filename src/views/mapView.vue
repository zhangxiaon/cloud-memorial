<template>
  <div class="map-view">
    <!-- 切换按钮 -->
    <div class="bing-map" title="高德部分地区无卫星影像，如需查看，请科学上网使用 Bing 地图">
      <button @click="activeMap='amap'" :class="{ active: activeMap==='amap' }">高德地图</button>
      <button @click="activeMap='bing'" :class="{ active: activeMap==='bing' }">Bing 地图</button>
    </div>

    <!-- 高德地图 -->
    <div v-show="activeMap==='amap'" id="map" style="width: 100%; height: 100vh;"></div>

    <!-- Bing 地图 -->
    <div v-show="activeMap==='bing'" id="bing-map" style="width: 100%; height: 100vh;"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";

const activeMap = ref("amap"); // 默认显示高德地图

// 获取墓碑信息
let grave = window.localStorage.getItem("grave");
grave = grave ? JSON.parse(grave) : {};
const lng = parseFloat(grave.lng);
const lat = parseFloat(grave.lat);
const title = grave.title;
const [wgsLng, wgsLat] = gcj02ToWgs84(lng, lat);

onMounted(() => {
  loadAmap()
  loadBingMap();
});


// ----------------- 高德地图 -----------------
let aMapInstance = null;
const loadAmap = async() => {
  const AMap = await AMapLoader.load({
    key: "59150528064ab34d7adab064a5bd28f9",
    version: "2.0",
    plugins: ["AMap.Scale", "AMap.ToolBar"],
  });

  aMapInstance = new AMap.Map("map", {
    zoom: 15,
    center: [lng, lat],
  });

  const satellite = new AMap.TileLayer.Satellite();
  aMapInstance.add(satellite);

  const img = new Image();
  img.src = grave.photo;
  img.onerror = () => { img.src = 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png' }; // 图片失败回退默认图
  img.onload = () => {
    // 创建 marker
    const marker = new AMap.Marker({
      position: [lng, lat],
      map:aMapInstance,
      content: `<img class="marker-icon" src="${img.src}" />`,
      anchor: 'bottom-center',
      title
    });
    // 点击显示 InfoWindow
    let opening = false;
    marker.on("click", () => {
      if (opening) return;
      opening = true;
      setTimeout(() => opening = false, 300);
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
        isCustom: true,
      });
      infoWindow.open(aMapInstance, [lng, lat]);

      // 延迟绑定事件，确保 InfoWindow 渲染完成
      setTimeout(() => {
        const textEl = document.querySelector(".tomb-text");
        if (textEl) {
          textEl.addEventListener("wheel", (e) => e.stopPropagation());
        }
      }, 100);
    });
  };



}

// ----------------- Bing 地图 -----------------
let bingMapInstance = null;
const loadBingMap = () => {
  if (!window.Microsoft || !window.Microsoft.Maps) {
    const script = document.createElement("script");
    script.src = `https://www.bing.com/api/maps/mapcontrol?key=YOUR_BING_KEY&callback=bingMapsLoaded`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    window.bingMapsLoaded = initBingMap;
  } else {
    initBingMap();
  }
};

const initBingMap = () => {
  let bingMapLoc = new Microsoft.Maps.Location(wgsLat, wgsLng)
  bingMapInstance = new Microsoft.Maps.Map("#bing-map", {
    center: bingMapLoc,
    zoom: 16,
    mapTypeId: Microsoft.Maps.MapTypeId.aerial,
  });

  const pin = new Microsoft.Maps.Pushpin(
      bingMapLoc,
      { title, text: "" }
  );
  bingMapInstance.entities.push(pin);

  // InfoBox 使用同样的 HTML 样式
  const infobox = new Microsoft.Maps.Infobox(
      bingMapLoc,
      {
        visible: false,
        htmlContent: `
        <div class="tombstone-3d" style="width:220px;">
          <div class="tomb-top">
            <img src="${grave.photo}" alt="">
          </div>
          <div class="tomb-body">
            <div class="tomb-header">${grave.title}</div>
            <div class="tomb-text">${grave.bio}</div>
          </div>
          <div class="tomb-base"></div>
        </div>
      `,
        offset: new Microsoft.Maps.Point(-110, 10),
      }
  );
  infobox.setMap(bingMapInstance);

  Microsoft.Maps.Events.addHandler(pin, "click", () => {
    infobox.setOptions({ visible: true });
  });
};

// 判断是否在中国范围
function outOfChina(lng, lat) {
  return (
      lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271
  );
}

function transformLat(x, y) {
  let ret =
      -100.0 +
      2.0 * x +
      3.0 * y +
      0.2 * y * y +
      0.1 * x * y +
      0.2 * Math.sqrt(Math.abs(x));
  ret +=
      ((20.0 * Math.sin(6.0 * x * Math.PI) +
              20.0 * Math.sin(2.0 * x * Math.PI)) *
          2.0) /
      3.0;
  ret +=
      ((20.0 * Math.sin(y * Math.PI) +
              40.0 * Math.sin((y / 3.0) * Math.PI)) *
          2.0) /
      3.0;
  ret +=
      ((160.0 * Math.sin((y / 12.0) * Math.PI) +
              320 * Math.sin((y * Math.PI) / 30.0)) *
          2.0) /
      3.0;
  return ret;
}

function transformLng(x, y) {
  let ret =
      300.0 +
      x +
      2.0 * y +
      0.1 * x * x +
      0.1 * x * y +
      0.1 * Math.sqrt(Math.abs(x));
  ret +=
      ((20.0 * Math.sin(6.0 * x * Math.PI) +
              20.0 * Math.sin(2.0 * x * Math.PI)) *
          2.0) /
      3.0;
  ret +=
      ((20.0 * Math.sin(x * Math.PI) +
              40.0 * Math.sin((x / 3.0) * Math.PI)) *
          2.0) /
      3.0;
  ret +=
      ((150.0 * Math.sin((x / 12.0) * Math.PI) +
              300.0 * Math.sin((x / 30.0) * Math.PI)) *
          2.0) /
      3.0;
  return ret;
}

function gcj02ToWgs84(lng, lat) {
  if (outOfChina(lng, lat)) {
    return [lng, lat];
  } else {
    const a = 6378245.0;
    const ee = 0.00669342162296594323;
    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLng = transformLng(lng - 105.0, lat - 35.0);
    let radLat = (lat / 180.0) * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    let sqrtMagic = Math.sqrt(magic);
    dLat =
        (dLat * 180.0) /
        (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
    dLng =
        (dLng * 180.0) /
        ((a / sqrtMagic) * Math.cos(radLat) * Math.PI);
    const mgLat = lat + dLat;
    const mgLng = lng + dLng;
    return [lng * 2 - mgLng, lat * 2 - mgLat];
  }
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
  z-index: 1000;
}
.bing-map button {
  margin-right: 5px;
  padding: 3px 6px;
  cursor: pointer;
  background-color: transparent;
  color: #ccc;
  border: 1px solid #ccc;
}
.bing-map button:hover,.bing-map button:focus {
  border-color: #ccc;
  outline:none;
}
.bing-map button.active {
  color: #fff;
}

/* 高德 marker 样式 */
.marker-icon {
  width: 26px;
  height: 35px;
  object-fit: cover;
  mask-image: url('https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png');
  mask-repeat: no-repeat;
  mask-size: cover;
}

/* 原有墓碑样式保持不变 */
.tombstone-3d { width: 220px; font-family: "Georgia", serif; position: relative; text-align: center; perspective: 600px; transform-style: preserve-3d; }
.tomb-top { width: 120px; height: 60px; margin: 0 auto; border-radius: 60px 60px 0 0; border: 2px solid #666; box-shadow: inset -2px -2px 6px rgba(0,0,0,0.2), 2px 2px 8px rgba(0,0,0,0.3); transform: rotateX(5deg); background-image: url('../assets/bg.jpg'); background-size: cover; box-sizing: border-box; display:flex; justify-content:center; align-items:center; }
.tomb-top img { height: 50%; margin-top:10px; }
.tomb-body { width: 120px; margin:0 auto; background: linear-gradient(145deg,#eee 0%,#ccc 100%); border:2px solid #666; border-radius:0 0 10px 10px; padding:8px; margin-top:-2px; box-shadow: inset -2px -2px 6px rgba(0,0,0,0.2),2px 2px 8px rgba(0,0,0,0.3); transform: rotateX(2deg); background-image: url('../assets/bg.jpg'); background-size: cover; box-sizing: border-box; overflow:hidden;}
.tomb-header { font-size:16px; font-weight:bold; margin-bottom:6px; color:#fff; text-shadow:1px 1px 2px rgba(0,0,0,0.2);}
.tomb-text { writing-mode: vertical-rl; text-orientation: upright; line-height:1.4em; font-family:"SimSun","Georgia",serif; font-size:14px; color:#fff; width:100%; height:110px; text-align:start; overflow-x:auto; margin-bottom:8px; padding:0 10px;}
.tomb-text img { height:70%; width:auto; margin:15% 0;}
.tomb-base { width:140px; height:12px; background:#999; margin:0 auto; border-radius:4px; box-shadow: inset -2px -2px 4px rgba(0,0,0,0.3), 2px 2px 6px rgba(0,0,0,0.3); transform: rotateX(-1deg); background-image: url('../assets/bg.jpg'); background-size: cover;}

#missingCredential{
  display: none;
}
</style>
