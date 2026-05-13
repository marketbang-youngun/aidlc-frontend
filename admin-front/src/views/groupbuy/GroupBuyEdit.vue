<template>
    <div>
        <CRow class="mb-3">
            <CCol>
                <h5 class="mb-0">공동구매 수정</h5>
            </CCol>
        </CRow>

        <CCard>
            <CCardBody>
                <CForm @submit.prevent="handle_submit">
                    <h6 class="mb-3">상품 정보</h6>

                    <div class="mb-3">
                        <CFormLabel>상품명</CFormLabel>
                        <CFormInput v-model="store.form_data.productName" size="sm" required />
                    </div>

                    <div class="mb-3">
                        <CFormLabel>상품 이미지 URL</CFormLabel>
                        <CFormInput v-model="store.form_data.productImageUrl" size="sm" />
                    </div>

                    <div v-if="store.form_data.productImageUrl" class="mb-3">
                        <img :src="store.form_data.productImageUrl" alt="상품 이미지" style="max-width: 200px; max-height: 200px;" />
                    </div>

                    <div class="mb-3">
                        <CFormLabel>수입사</CFormLabel>
                        <CFormInput v-model="store.form_data.importerName" size="sm" />
                    </div>

                    <div class="mb-3">
                        <CFormLabel>정가</CFormLabel>
                        <CFormInput v-model.number="store.form_data.originalPrice" size="sm" type="number" required />
                    </div>

                    <div class="mb-3">
                        <CFormLabel>상품 설명</CFormLabel>
                        <CFormInput v-model="store.form_data.productDescription" size="sm" />
                    </div>

                    <hr />
                    <h6 class="mb-3">공동구매 정보</h6>

                    <div class="mb-3">
                        <CFormLabel>공구 제목</CFormLabel>
                        <CFormInput v-model="store.form_data.title" size="sm" required />
                    </div>

                    <div class="mb-3">
                        <CFormLabel>공구 가격</CFormLabel>
                        <CFormInput v-model.number="store.form_data.groupbuyPrice" size="sm" type="number" required />
                    </div>

                    <CRow class="mb-3">
                        <CCol :md="6">
                            <CFormLabel>목표 수량</CFormLabel>
                            <CFormInput v-model.number="store.form_data.targetQuantity" size="sm" type="number" required />
                        </CCol>
                        <CCol :md="6">
                            <CFormLabel>최대 수량</CFormLabel>
                            <CFormInput v-model.number="store.form_data.maxQuantity" size="sm" type="number" required />
                        </CCol>
                    </CRow>

                    <CRow class="mb-3">
                        <CCol :md="6">
                            <CFormLabel>1인 최소 수량</CFormLabel>
                            <CFormInput v-model.number="store.form_data.minPerUser" size="sm" type="number" required />
                        </CCol>
                        <CCol :md="6">
                            <CFormLabel>1인 최대 수량</CFormLabel>
                            <CFormInput v-model.number="store.form_data.maxPerUser" size="sm" type="number" required />
                        </CCol>
                    </CRow>

                    <CRow class="mb-3">
                        <CCol :md="6">
                            <CFormLabel>시작일시</CFormLabel>
                            <CFormInput v-model="store.form_data.startAt" size="sm" type="datetime-local" required />
                        </CCol>
                        <CCol :md="6">
                            <CFormLabel>마감일시</CFormLabel>
                            <CFormInput v-model="store.form_data.endAt" size="sm" type="datetime-local" required />
                        </CCol>
                    </CRow>

                    <div class="mb-3">
                        <CFormLabel>배송 예정일</CFormLabel>
                        <CFormInput v-model="store.form_data.deliveryDate" size="sm" type="date" required />
                    </div>

                    <div class="d-flex gap-2">
                        <CButton type="submit" color="primary" size="sm" :disabled="is_submitting">
                            {{ is_submitting ? "저장 중..." : "저장" }}
                        </CButton>
                        <CButton color="light" size="sm" @click="router.push(`/groupbuy/${route.params.id}`)">
                            취소
                        </CButton>
                    </div>
                </CForm>
            </CCardBody>
        </CCard>
    </div>
</template>

<script setup>
import{ref, onMounted}from"vue";
import{useRoute, useRouter}from"vue-router";
import{CRow, CCol, CCard, CCardBody, CForm, CFormInput, CFormLabel, CButton}from"@coreui/vue";
import{useGroupbuyStore}from"../../pinia/groupbuy.js";
import{get_groupbuy_detail, update_groupbuy}from"../../api/groupbuy.js";

const route = useRoute();
const router = useRouter();
const store = useGroupbuyStore();

const is_submitting = ref(false);

onMounted(async()=>{
    try{
        const res = await get_groupbuy_detail(route.params.id);
        const data = res.data || {};
        store.set_form({
            title: data.title || "",
            productName: data.productName || "",
            productImageUrl: data.productImageUrl || "",
            importerName: data.importerName || "",
            originalPrice: data.originalPrice || 0,
            productDescription: data.productDescription || "",
            groupbuyPrice: data.groupbuyPrice || 0,
            targetQuantity: data.targetQuantity || 0,
            maxQuantity: data.maxQuantity || 0,
            minPerUser: data.minPerUser || 1,
            maxPerUser: data.maxPerUser || 1,
            startAt: data.startAt ? data.startAt.substring(0, 16) : "",
            endAt: data.endAt ? data.endAt.substring(0, 16) : "",
            deliveryDate: data.deliveryDate || ""
        });
    }catch(e){
        console.error(e);
        alert("데이터를 불러올 수 없습니다.");
        router.push("/groupbuy/list");
    }
});

const handle_submit = async()=>{
    const form = store.form_data;
    if(!form.title){
        alert("공구 제목을 입력하세요.");
        return;
    }
    if(!form.productName){
        alert("상품명을 입력하세요.");
        return;
    }
    if(form.groupbuyPrice <= 0){
        alert("공구 가격을 입력하세요.");
        return;
    }
    if(form.targetQuantity <= 0){
        alert("목표 수량을 입력하세요.");
        return;
    }
    if(form.maxQuantity <= 0){
        alert("최대 수량을 입력하세요.");
        return;
    }
    if(!form.startAt || !form.endAt){
        alert("시작일시와 마감일시를 입력하세요.");
        return;
    }
    if(!form.deliveryDate){
        alert("배송 예정일을 입력하세요.");
        return;
    }

    is_submitting.value = true;
    try{
        const payload = {
            title: form.title,
            productName: form.productName,
            productImageUrl: form.productImageUrl,
            importerName: form.importerName,
            originalPrice: form.originalPrice,
            productDescription: form.productDescription,
            groupbuyPrice: form.groupbuyPrice,
            targetQuantity: form.targetQuantity,
            maxQuantity: form.maxQuantity,
            minPerUser: form.minPerUser,
            maxPerUser: form.maxPerUser,
            startAt: form.startAt,
            endAt: form.endAt,
            deliveryDate: form.deliveryDate
        };
        await update_groupbuy(route.params.id, payload);
        alert("공동구매가 수정되었습니다.");
        router.push(`/groupbuy/${route.params.id}`);
    }catch(e){
        console.error(e);
    }finally{
        is_submitting.value = false;
    }
};
</script>

<style scoped lang="sass">
</style>
