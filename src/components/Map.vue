<template>
  <div class="map-container">
    <div id="map" style="width: 100%; height: 100vh"></div>
  </div>
</template>

<script setup>
import {onMounted} from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";

// GitHub 仓库信息
const repoOwner = "zhangxiaon";
const repoName = "cloud-memorial";

// 获取 Issue 数据
async function fetchIssues() {
  const cacheKey = "github_issues_cache";
  const cacheTimeKey = "github_issues_cache_time";
  const now = Date.now();

  // 1. 判断缓存是否存在且有效（1分钟内有效）
  const cachedData = localStorage.getItem(cacheKey);
  const cachedTime = localStorage.getItem(cacheTimeKey);
  if (cachedData && cachedTime && now - cachedTime < 1000 * 60) {
    console.log("使用缓存数据");
    return JSON.parse(cachedData);
  }

  // 2. 缓存不存在或过期，去请求 GitHub API
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;
  const res = await fetch(url);
  const issues = await res.json();

  const graves = issues.map(issue => {
    // 1️⃣ 生平简介：取关键字“生平简介：”到“照片：”前
    const photoIndex = issue.body.indexOf('照片：');
    const bio = photoIndex > -1
        ? issue.body.slice(0, photoIndex).trim()
        : issue.body.trim();

// 2️⃣ 照片字段：只取“照片：”之后的第一张图片
    let photo = "";
    if (photoIndex > -1) {
      const geoIndex = issue.body.indexOf('地理位置：', photoIndex);
      const photoArea = geoIndex > -1
          ? issue.body.slice(photoIndex, geoIndex)
          : issue.body.slice(photoIndex);
      const photoMatch = photoArea.match(/<img.*?src="(.*?)"/);
      photo = photoMatch ? photoMatch[1] : "";
    }

    // 3️⃣ 地理位置
    const coordRegex = /地理位置：[\s\S]*?(?:lat\s*:\s*(?<lat>-?\d+(?:\.\d+)?)\s*[,，]?\s*lng\s*:\s*(?<lng>-?\d+(?:\.\d+)?)|lng\s*:\s*(?<lng2>-?\d+(?:\.\d+)?)\s*[,，]?\s*lat\s*:\s*(?<lat2>-?\d+(?:\.\d+)?))/;
    const match = issue.body.match(coordRegex);
    let lat = 0, lng = 0;
    if (match && match.groups) {
      lat = parseFloat(match.groups.lat || match.groups.lat2);
      lng = parseFloat(match.groups.lng || match.groups.lng2);
    }
    debugger
    return {
      title: issue.title,
      bio: bio,
      photo,
      lat,
      lng
    };
  });

  // 3. 保存到缓存
  localStorage.setItem(cacheKey, JSON.stringify(graves));
  localStorage.setItem(cacheTimeKey, now);

  console.log("使用 API 数据");
  return graves;
}

onMounted(async () => {
  const AMap = await AMapLoader.load({
    key: "59150528064ab34d7adab064a5bd28f9", // 替换成你的 key
    version: "2.0",
    plugins: ["AMap.Scale", "AMap.ToolBar"],
  });

  const map = new AMap.Map("map", {
    zoom: 5,
    center: [105.0, 36.0],
  });
  const Satellite = new AMap.TileLayer.Satellite()
  map.add(Satellite);
  const graves = await fetchIssues();
  debugger
  graves.forEach(grave => {
    if (!grave.lat || !grave.lng) return;
    // 创建 marker，使用 issue 图片作为 icon
    const marker = new AMap.Marker({
      position: [grave.lng, grave.lat],
      map,
      content: grave.photo ? `<img class="marker-icon" src="${grave.photo}" />` : "",
      anchor: 'bottom-center',
      title: grave.title,
    });

    // 点击显示 InfoWindow
    marker.on("click", () => {
      window.localStorage.setItem('grave', JSON.stringify(grave))
      window.open(`/#/mapView`)
    });
  });
});
</script>

<style>
.map-container {
  width: 100%;
  height: 100vh;
}

.marker-icon {
  width: 26px;
  height: 35px;
  object-fit: cover; /* 保持图片比例裁剪 */
  mask-image: url('https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png');
  mask-repeat: no-repeat;
  mask-size: cover;
}

.amap-marker {
  line-height: 0;
}

</style>
