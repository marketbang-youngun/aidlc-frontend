<template>
    <div>
        <CRow class="mb-3 align-items-center">
            <CCol>
                <h5 class="mb-0">공동구매 목록</h5>
            </CCol>
            <CCol class="text-end">
                <CButton color="primary" size="sm" @click="router.push('/groupbuy/create')">
                    공구 등록
                </CButton>
            </CCol>
        </CRow>

        <CCard>
            <CCardBody>
                <CNav variant="tabs" class="mb-3">
                    <CNavItem v-for="tab in status_tabs" :key="tab.value">
                        <CNavLink
                            :active="current_status === tab.value"
                            href="javascript:void(0)"
                            @click="change_status(tab.value)"
                        >
                            {{ tab.label }}
                        </CNavLink>
                    </CNavItem>
                </CNav>

                <CTable hover striped size="sm">
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>제목</CTableHeaderCell>
                            <CTableHeaderCell>상태</CTableHeaderCell>
                            <CTableHeaderCell>현재/목표</CTableHeaderCell>
                            <CTableHeaderCell>마감일</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        <CTableRow
                            v-for="item in list"
                            :key="item.id"
                            style="cursor: pointer;"
                            @click="router.push(`/groupbuy/${item.id}`)"
                        >
                            <CTableDataCell>{{ item.title }}</CTableDataCell>
                            <CTableDataCell>
                                <CBadge :color="get_badge_color(item.status)">
                                    {{ get_status_label(item.status) }}
                                </CBadge>
                            </CTableDataCell>
                            <CTableDataCell>{{ item.currentQty || 0 }}/{{ item.targetQty }}</CTableDataCell>
                            <CTableDataCell>{{ item.endAt }}</CTableDataCell>
                        </CTableRow>
                        <CTableRow v-if="list.length === 0">
                            <CTableDataCell colspan="4" class="text-center text-muted">
                                데이터가 없습니다.
                            </CTableDataCell>
                        </CTableRow>
                    </CTableBody>
                </CTable>

                <div class="d-flex justify-content-center mt-3">
                    <CButton
                        size="sm"
                        color="light"
                        :disabled="current_page <= 0"
                        @click="change_page(current_page - 1)"
                    >
                        이전
                    </CButton>
                    <span class="mx-3 align-self-center">{{ current_page + 1 }} 페이지</span>
                    <CButton
                        size="sm"
                        color="light"
                        :disabled="list.length < page_size"
                        @click="change_page(current_page + 1)"
                    >
                        다음
                    </CButton>
                </div>
            </CCardBody>
        </CCard>
    </div>
</template>

<script setup>
import{ref, onMounted}from"vue";
import{useRouter}from"vue-router";
import{CRow, CCol, CCard, CCardBody, CButton, CNav, CNavItem, CNavLink, CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell, CBadge}from"@coreui/vue";
import{get_groupbuy_list}from"../../api/groupbuy.js";

const router = useRouter();

const status_tabs = [
    {label: "전체", value: ""},
    {label: "모집중", value: "RECRUITING"},
    {label: "확정", value: "CONFIRMED"},
    {label: "자동취소", value: "AUTO_CANCELLED"},
    {label: "수동취소", value: "MANUAL_CANCELLED"},
    {label: "배송준비", value: "PREPARING"},
    {label: "완료", value: "COMPLETED"}
];

const current_status = ref("");
const current_page = ref(0);
const page_size = 20;
const list = ref([]);

const fetch_list = async()=>{
    try{
        const res = await get_groupbuy_list(current_status.value, current_page.value, page_size);
        list.value = res.data?.content || [];
    }catch(e){
        console.error(e);
        list.value = [];
    }
};

const change_status = (status)=>{
    current_status.value = status;
    current_page.value = 0;
    fetch_list();
};

const change_page = (page)=>{
    current_page.value = page;
    fetch_list();
};

const get_badge_color = (status)=>{
    const map = {
        "RECRUITING": "primary",
        "CONFIRMED": "success",
        "AUTO_CANCELLED": "warning",
        "MANUAL_CANCELLED": "danger",
        "PREPARING": "info",
        "COMPLETED": "dark"
    };
    return map[status] || "secondary";
};

const get_status_label = (status)=>{
    const map = {
        "RECRUITING": "모집중",
        "CONFIRMED": "확정",
        "AUTO_CANCELLED": "자동취소",
        "MANUAL_CANCELLED": "수동취소",
        "PREPARING": "배송준비",
        "COMPLETED": "완료"
    };
    return map[status] || status;
};

onMounted(()=>{
    fetch_list();
});
</script>

<style scoped lang="sass">
</style>
