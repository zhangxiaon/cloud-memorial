<template>
  <div class="map-container">
    <div id="map" style="width: 100%; height: 100vh"></div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

// 你的 GitHub 仓库
const repoOwner = "zhangxiaon";
const repoName = "cloud-memorial";

async function fetchIssues() {
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;
  const res = await fetch(url);
  const issues = await res.json();

  // 转换为墓碑数据格式
  return issues.map(issue => {
    const match = issue.body.match(/lat:([\d.]+),lng:([\d.]+)/);
    return {
      title: issue.title,
      body: issue.body,
      photo: issue.body.match(/!\[.*\]\((.*)\)/)?.[1] || "",
      lat: match ? parseFloat(match[1]) : 0,
      lng: match ? parseFloat(match[2]) : 0,
    };
  });
}

onMounted(async () => {
  // 初始化高德地图
  const map = new AMap.Map("map", {
    zoom: 5,
    center: [105.0, 36.0], // 中国中心点
  });

  const graves = await fetchIssues();

  graves.forEach(grave => {
    if (!grave.lat || !grave.lng) return;

    const marker = new AMap.Marker({
      position: [grave.lng, grave.lat],
      map,
    });

    marker.on("click", () => {
      const content = `
        <div>
          <h3>${grave.title}</h3>
          <p>${grave.body}</p>
          ${grave.photo ? `<img src="${grave.photo}" style="max-width:200px"/>` : ""}
          <br/>
          <button onclick="window.open('https://www.amap.com/place/${grave.lng},${grave.lat}')">
            查看高德地图
          </button>
          <button onclick="window.open('https://www.bing.com/maps?cp=${grave.lat}~${grave.lng}&lvl=18&style=a')">
            查看 Bing 卫星图
          </button>
          <p style="color:red;font-size:12px">
            ⚠️ 高德部分地区无卫星影像，如需查看，请科学上网使用 Bing 地图。
          </p>
        </div>
      `;

      const infoWindow = new AMap.InfoWindow({
        content,
        offset: new AMap.Pixel(0, -30),
      });
      infoWindow.open(map, [grave.lng, grave.lat]);
    });
  });
});
</script>

<style>
.map-container {
  width: 100%;
  height: 100vh;
}
</style>
