import{createApp}from"vue";
import{createPinia}from"pinia";
import App from"./App.vue";
import router from"./router/index.js";

import"@coreui/coreui/dist/css/coreui.min.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount("#app");
