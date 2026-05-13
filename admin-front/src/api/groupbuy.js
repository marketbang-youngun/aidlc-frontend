import Send from"./Send.js";

export const create_groupbuy = (data)=>{
    return Send.post("/admin/v1/group-buy", data);
};

export const get_groupbuy_list = (status, page, size)=>{
    const params = {page, size};
    if(status){
        params.status = status;
    }
    return Send.get("/admin/v1/group-buy/list", {params});
};

export const get_groupbuy_detail = (id)=>{
    return Send.get(`/admin/v1/group-buy/${id}`);
};

export const update_groupbuy = (id, data)=>{
    return Send.put(`/admin/v1/group-buy/${id}`, data);
};

export const cancel_groupbuy = (id)=>{
    return Send.post(`/admin/v1/group-buy/${id}/cancel`);
};

export const prepare_groupbuy = (id)=>{
    return Send.post(`/admin/v1/group-buy/${id}/prepare`);
};

export const complete_groupbuy = (id)=>{
    return Send.post(`/admin/v1/group-buy/${id}/complete`);
};

export const get_participants = (id)=>{
    return Send.get(`/admin/v1/group-buy/${id}/participants`);
};
