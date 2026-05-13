<template>
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <CCard class="p-4" style="width: 400px;">
            <CCardBody>
                <h4 class="mb-4 text-center">마켓뱅 관리자 로그인</h4>
                <CForm @submit.prevent="handle_login">
                    <div class="mb-3">
                        <CFormLabel>아이디</CFormLabel>
                        <CFormInput
                            v-model="user_id"
                            size="sm"
                            placeholder="아이디를 입력하세요"
                            required
                        />
                    </div>
                    <div class="mb-3">
                        <CFormLabel>비밀번호</CFormLabel>
                        <CFormInput
                            v-model="user_pwd"
                            type="password"
                            size="sm"
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>
                    <CButton type="submit" color="primary" size="sm" class="w-100" :disabled="is_loading">
                        {{ is_loading ? "로그인 중..." : "로그인" }}
                    </CButton>
                </CForm>
            </CCardBody>
        </CCard>
    </div>
</template>

<script setup>
import{ref}from"vue";
import{useRouter}from"vue-router";
import{CCard, CCardBody, CForm, CFormInput, CFormLabel, CButton}from"@coreui/vue";
import{login}from"../api/auth.js";

const router = useRouter();

const user_id = ref("");
const user_pwd = ref("");
const is_loading = ref(false);

const handle_login = async()=>{
    if(!user_id.value || !user_pwd.value){
        alert("아이디와 비밀번호를 입력하세요.");
        return;
    }
    is_loading.value = true;
    try{
        await login(user_id.value, user_pwd.value);
        sessionStorage.setItem("isLoggedIn", "true");
        router.push("/groupbuy/list");
    }catch(e){
        console.error(e);
    }finally{
        is_loading.value = false;
    }
};
</script>

<style scoped lang="sass">
</style>
