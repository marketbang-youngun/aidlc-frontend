import{createRouter, createWebHistory}from"vue-router";

const routes = [
    {
        path: "/login",
        name: "Login",
        component: ()=>import("../views/Login.vue")
    },
    {
        path: "/",
        name: "Home",
        component: ()=>import("../layouts/DefaultLayout.vue"),
        redirect: "/groupbuy/list",
        children: [
            {
                path: "groupbuy/list",
                name: "GroupBuyList",
                component: ()=>import("../views/groupbuy/GroupBuyList.vue")
            },
            {
                path: "groupbuy/create",
                name: "GroupBuyCreate",
                component: ()=>import("../views/groupbuy/GroupBuyCreate.vue")
            },
            {
                path: "groupbuy/:id",
                name: "GroupBuyDetail",
                component: ()=>import("../views/groupbuy/GroupBuyDetail.vue")
            },
            {
                path: "groupbuy/:id/edit",
                name: "GroupBuyEdit",
                component: ()=>import("../views/groupbuy/GroupBuyEdit.vue")
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next)=>{
    const is_login_page = to.path === "/login";
    const has_cookie = document.cookie.includes("JSESSIONID") || document.cookie.includes("token");
    if(!is_login_page && !has_cookie){
        const stored_auth = sessionStorage.getItem("isLoggedIn");
        if(!stored_auth){
            next("/login");
            return;
        }
    }
    next();
});

export default router;
