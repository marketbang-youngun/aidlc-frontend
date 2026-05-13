import{defineStore}from"pinia";
import{ref}from"vue";

export const useGroupbuyStore = defineStore("groupbuy", ()=>{
    const form_data = ref({
        productUrl: "",
        productName: "",
        productImageUrl: "",
        importerName: "",
        originalPrice: 0,
        productDescription: "",
        title: "",
        groupbuyPrice: 0,
        targetQuantity: 0,
        maxQuantity: 0,
        minPerUser: 1,
        maxPerUser: 1,
        startAt: "",
        endAt: "",
        deliveryDate: ""
    });

    const reset_form = ()=>{
        form_data.value = {
            productUrl: "",
            productName: "",
            productImageUrl: "",
            importerName: "",
            originalPrice: 0,
            productDescription: "",
            title: "",
            groupbuyPrice: 0,
            targetQuantity: 0,
            maxQuantity: 0,
            minPerUser: 1,
            maxPerUser: 1,
            startAt: "",
            endAt: "",
            deliveryDate: ""
        };
    };

    const set_form = (data)=>{
        form_data.value = {...form_data.value, ...data};
    };

    return{form_data, reset_form, set_form};
});
