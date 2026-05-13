import Send from"./Send.js";

export const login = (userId, userPwd)=>{
    return Send.post("/admin/v1/user/login", {userId, userPwd});
};
