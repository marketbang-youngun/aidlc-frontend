<template>
    <div>
        <CRow class="mb-3 align-items-center">
            <CCol>
                <h5 class="mb-0">공동구매 상세</h5>
            </CCol>
            <CCol class="text-end">
                <CButton
                    v-if="detail.status === 'RECRUITING'"
                    color="light"
                    size="sm"
                    class="me-2"
                    @click="router.push(`/groupbuy/${route.params.id}/edit`)"
                >
                    수정
                </CButton>
                <CButton color="light" size="sm" @click="router.push('/groupbuy/list')">
                    목록
                </CButton>
            </CCol>
        </CRow>

        <CCard class="mb-3">
            <CCardBody>
                <CRow>
                    <CCol :md="8">
                        <table class="table table-sm table-borderless">
                            <tbody>
                                <tr>
                                    <th style="width: 120px;">제목</th>
                                    <td>{{ detail.title }}</td>
                                </tr>
                                <tr>
                                    <th>상태</th>
                                    <td>
                                        <CBadge :color="get_badge_color(detail.status)">
                                            {{ get_status_label(detail.status) }}
                                        </CBadge>
                                    </td>
                                </tr>
                                <tr>
                                    <th>상품명</th>
                                    <td>{{ detail.productName }}</td>
                                </tr>
                                <tr>
                                    <th>수입사</th>
                                    <td>{{ detail.importerName }}</td>
                                </tr>
                                <tr>
                                    <th>정가</th>
                                    <td>{{ Number(detail.originalPrice || 0).toLocaleString() }}원</td>
                                </tr>
                                <tr>
                                    <th>공구 가격</th>
                                    <td>{{ Number(detail.groupbuyPrice || 0).toLocaleString() }}원</td>
                                </tr>
                                <tr>
                                    <th>현재/목표/최대</th>
                                    <td>{{ detail.currentQuantity || 0 }} / {{ detail.targetQuantity }} / {{ detail.maxQuantity }}</td>
                                </tr>
                                <tr>
                                    <th>1인 수량</th>
                                    <td>{{ detail.minPerUser }} ~ {{ detail.maxPerUser }}</td>
                                </tr>
                                <tr>
                                    <th>시작일시</th>
                                    <td>{{ detail.startAt }}</td>
                                </tr>
                                <tr>
                                    <th>마감일시</th>
                                    <td>{{ detail.endAt }}</td>
                                </tr>
                                <tr>
                                    <th>배송 예정일</th>
                                    <td>{{ detail.deliveryDate }}</td>
                                </tr>
                                <tr>
                                    <th>상품 설명</th>
                                    <td>{{ detail.productDescription }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </CCol>
                    <CCol :md="4" class="text-center">
                        <img
                            v-if="detail.productImageUrl"
                            :src="detail.productImageUrl"
                            alt="상품 이미지"
                            style="max-width: 100%; max-height: 250px;"
                        />
                    </CCol>
                </CRow>

                <hr />

                <div class="d-flex gap-2">
                    <CButton
                        v-if="detail.status === 'RECRUITING'"
                        color="danger"
                        size="sm"
                        @click="handle_cancel"
                    >
                        수동취소
                    </CButton>
                    <CButton
                        v-if="detail.status === 'CONFIRMED'"
                        color="info"
                        size="sm"
                        @click="handle_prepare"
                    >
                        배송준비
                    </CButton>
                    <CButton
                        v-if="detail.status === 'PREPARING'"
                        color="success"
                        size="sm"
                        @click="handle_complete"
                    >
                        배송완료
                    </CButton>
                </div>
            </CCardBody>
        </CCard>

        <CCard>
            <CCardBody>
                <h6 class="mb-3">참여자 목록 ({{ participants.length }}명)</h6>
                <CTable hover striped size="sm">
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>참여자</CTableHeaderCell>
                            <CTableHeaderCell>수량</CTableHeaderCell>
                            <CTableHeaderCell>참여일시</CTableHeaderCell>
                            <CTableHeaderCell>상태</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        <CTableRow v-for="p in participants" :key="p.id">
                            <CTableDataCell>{{ p.userName || p.userId }}</CTableDataCell>
                            <CTableDataCell>{{ p.quantity }}</CTableDataCell>
                            <CTableDataCell>{{ p.createdAt }}</CTableDataCell>
                            <CTableDataCell>
                                <CBadge :color="p.status === 'CANCELLED' ? 'danger' : 'success'">
                                    {{ p.status === "CANCELLED" ? "취소" : "참여" }}
                                </CBadge>
                            </CTableDataCell>
                        </CTableRow>
                        <CTableRow v-if="participants.length === 0">
                            <CTableDataCell colspan="4" class="text-center text-muted">
                                참여자가 없습니다.
                            </CTableDataCell>
                        </CTableRow>
                    </CTableBody>
                </CTable>
            </CCardBody>
        </CCard>
    </div>
</template>

<script setup>
import{ref, onMounted, onBeforeUnmount}from"vue";
import{useRoute, useRouter}from"vue-router";
import{CRow, CCol, CCard, CCardBody, CButton, CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell, CBadge}from"@coreui/vue";
import{get_groupbuy_detail, get_participants, cancel_groupbuy, prepare_groupbuy, complete_groupbuy}from"../../api/groupbuy.js";

const route = useRoute();
const router = useRouter();

const detail = ref({});
const participants = ref([]);
let polling_timer = null;

const fetch_detail = async()=>{
    try{
        const res = await get_groupbuy_detail(route.params.id);
        detail.value = res.data || {};
    }catch(e){
        console.error(e);
    }
};

const fetch_participants = async()=>{
    try{
        const res = await get_participants(route.params.id);
        participants.value = res.data || [];
    }catch(e){
        console.error(e);
    }
};

const handle_cancel = async()=>{
    if(!confirm("정말 수동취소 하시겠습니까?")){
        return;
    }
    try{
        await cancel_groupbuy(route.params.id);
        alert("수동취소 되었습니다.");
        await fetch_detail();
    }catch(e){
        console.error(e);
    }
};

const handle_prepare = async()=>{
    if(!confirm("배송준비 상태로 변경하시겠습니까?")){
        return;
    }
    try{
        await prepare_groupbuy(route.params.id);
        alert("배송준비 상태로 변경되었습니다.");
        await fetch_detail();
    }catch(e){
        console.error(e);
    }
};

const handle_complete = async()=>{
    if(!confirm("배송완료 처리하시겠습니까?")){
        return;
    }
    try{
        await complete_groupbuy(route.params.id);
        alert("배송완료 처리되었습니다.");
        await fetch_detail();
    }catch(e){
        console.error(e);
    }
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
    fetch_detail();
    fetch_participants();
    polling_timer = setInterval(()=>{
        fetch_participants();
    }, 5000);
});

onBeforeUnmount(()=>{
    if(polling_timer){
        clearInterval(polling_timer);
        polling_timer = null;
    }
});
</script>

<style scoped lang="sass">
th
    color: #6c757d
    font-weight: 600
</style>
