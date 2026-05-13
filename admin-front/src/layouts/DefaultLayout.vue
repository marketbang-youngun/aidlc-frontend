<template>
    <div class="wrapper d-flex">
        <CSidebar visible>
            <CSidebarBrand class="d-flex align-items-center px-3 py-2">
                <strong>마켓뱅 관리자</strong>
            </CSidebarBrand>
            <CSidebarNav>
                <CNavItem>
                    <router-link class="nav-link" to="/groupbuy/list">
                        <CIcon :icon="cilList" class="nav-icon" />
                        공동구매 목록
                    </router-link>
                </CNavItem>
                <CNavItem>
                    <router-link class="nav-link" to="/groupbuy/create">
                        <CIcon :icon="cilPlus" class="nav-icon" />
                        공구 등록
                    </router-link>
                </CNavItem>
            </CSidebarNav>
        </CSidebar>
        <div class="wrapper d-flex flex-column flex-grow-1">
            <CHeader class="px-3 py-2 border-bottom">
                <CContainer fluid>
                    <span class="fw-semibold">공동구매 관리 패널</span>
                    <CButton size="sm" color="light" class="ms-auto" @click="handle_logout">
                        로그아웃
                    </CButton>
                </CContainer>
            </CHeader>
            <div class="body flex-grow-1 p-4">
                <CContainer fluid>
                    <router-view />
                </CContainer>
            </div>
        </div>
    </div>
</template>

<script setup>
import{useRouter}from"vue-router";
import{CSidebar, CSidebarBrand, CSidebarNav, CNavItem, CHeader, CContainer, CButton}from"@coreui/vue";
import{CIcon}from"@coreui/icons-vue";
import{cilList, cilPlus}from"@coreui/icons";

const router = useRouter();

const handle_logout = ()=>{
    sessionStorage.removeItem("isLoggedIn");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
};
</script>

<style scoped lang="sass">
.wrapper
    min-height: 100vh
</style>
