import Send from"./Send.js";

export const fetch_product = (url)=>{
    return Send.get("/common/v1/product/fetch", {params: {url}});
};
