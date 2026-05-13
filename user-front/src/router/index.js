import{createRouter, createWebHistory}from"vue-router";

const routes = [
  {
    path: "/",
    name: "GroupBuyList",
    component: ()=>import("../views/GroupBuyList.vue")
  },
  {
    path: "/groupbuy/:id",
    name: "GroupBuyDetail",
    component: ()=>import("../views/GroupBuyDetail.vue")
  },
  {
    path: "/my",
    name: "MyParticipations",
    component: ()=>import("../views/MyParticipations.vue")
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
