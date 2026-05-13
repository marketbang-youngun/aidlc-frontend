import axios from"axios";

const api = axios.create({
  baseURL: "/api/buyer/v1/public/groupbuy",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.response.use(
  response=>{
    const res = response.data;
    if(res.code === 0){
      return res.data;
    }
    return Promise.reject(new Error(res.message || "요청 처리 중 오류가 발생했습니다"));
  },
  error=>{
    const message = error.response?.data?.message || "네트워크 오류가 발생했습니다";
    return Promise.reject(new Error(message));
  }
);

export default api;
