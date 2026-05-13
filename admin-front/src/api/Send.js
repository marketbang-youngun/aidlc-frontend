import axios from"axios";

const instance = axios.create({
    baseURL: "/api",
    withCredentials: true,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json"
    }
});

instance.interceptors.response.use(
    response=>{
        const data = response.data;
        if(data.code !== 0){
            alert(data.message || "요청 처리 중 오류가 발생했습니다.");
            return Promise.reject(new Error(data.message));
        }
        if(data.isLogin === false){
            sessionStorage.removeItem("isLoggedIn");
            window.location.href = "/login";
            return Promise.reject(new Error("로그인이 필요합니다."));
        }
        return data;
    },
    error=>{
        if(error.response && error.response.status === 401){
            sessionStorage.removeItem("isLoggedIn");
            window.location.href = "/login";
        }else{
            alert("네트워크 오류가 발생했습니다.");
        }
        return Promise.reject(error);
    }
);

export default instance;
