import api from"./index.js";

export const fetch_groupbuy_list = ()=>{
  return api.get("/list");
};

export const fetch_groupbuy_detail = (id)=>{
  return api.get(`/${id}`);
};

export const fetch_groupbuy_status = (id)=>{
  return api.get(`/${id}/status`);
};

export const join_groupbuy = (id, payload)=>{
  return api.post(`/${id}/join`, payload);
};

export const cancel_groupbuy = (id, payload)=>{
  return api.post(`/${id}/cancel`, payload);
};

export const fetch_my_participations = (email)=>{
  return api.get("/my", { params: { email } });
};
