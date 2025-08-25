import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/home.vue";
import MapView from "../views/mapView.vue";
import AddOp from "../views/addOp.vue";

const routes = [
    { path: "/", name: "Home", component: Home },
    { path: "/mapView", name: "MapView", component: MapView },
    { path: "/addOp", name: "AddOp", component: AddOp },
];

const router = createRouter({
    history: createWebHashHistory(), // 改为 hash 模式
    routes,
});

export default router;
