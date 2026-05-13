<template>
    <div>
        <CRow class="mb-3">
            <CCol>
                <h5 class="mb-0">공구 등록</h5>
            </CCol>
        </CRow>

        <CCard>
            <CCardBody>
                <CForm @submit.prevent="handle_submit">
                    <h6 class="mb-3">상품 정보 불러오기</h6>
                    <CRow class="mb-3">
                        <CCol :md="9">
                            <CFormInput
                                v-model="store.form_data.productUrl"
                                size="md"
                                placeholder="상품 URL을 입력하세요"
                            />
                        </CCol>
                        <CCol :md="3">
                            <CButton
                                color="secondary"
                                size="md"
                                class="w-100"
                                :disabled="is_fetching"
                                @click="handle_fetch_product"
                            >
                                {{ is_fetching ? "불러오는 중..." : "불러오기" }}
                            </CButton>
                        </CCol>
                    </CRow>

                    <hr />
                    <h6 class="mb-3">상품 정보</h6>

                    <div class="mb-3">
                        <CFormLabel>상품명</CFormLabel>
                        <CFormInput v-model="store.form_data.productName" size="md" required />
                    </div>

                    <div class="mb-3">
                        <CFormLabel>상품 이미지 URL</CFormLabel>
                        <CFormInput v-model="store.form_data.productImageUrl" size="md" />
                    </div>

                    <div v-if="store.form_data.productImageUrl" class="mb-3">
                        <img :src="store.form_data.productImageUrl" alt="상품 이미지" style="max-width: 200px; max-height: 200px;" />
                    </div>

                    <div class="mb-3">
                        <CFormLabel>수입사</CFormLabel>
                        <CFormInput v-model="store.form_data.importerName" size="md" />
                    </div>

                    <div class="mb-3">
                        <CFormLabel>정가</CFormLabel>
                        <CFormInput v-model.number="store.form_data.originalPrice" size="md" type="number" required />
                    </div>

                    <div class="mb-3">
                        <CFormLabel>상품 설명</CFormLabel>
                        <CFormInput v-model="store.form_data.productDescription" size="md" />
                    </div>

                    <hr />
                    <h6 class="mb-3">공동구매 정보</h6>

                    <div class="mb-3">
                        <CFormLabel>공구 제목</CFormLabel>
                        <CFormInput v-model="store.form_data.title" size="md" required />
                    </div>

                    <div class="mb-3">
                        <CFormLabel>공구 가격</CFormLabel>
                        <CFormInput v-model.number="store.form_data.groupbuyPrice" size="md" type="number" required />
                    </div>

                    <CRow class="mb-3">
                        <CCol :md="6">
                            <CFormLabel>목표 수량</CFormLabel>
                            <CFormInput v-model.number="store.form_data.targetQuantity" size="md" type="number" required />
                        </CCol>
                        <CCol :md="6">
                            <CFormLabel>최대 수량</CFormLabel>
                            <CFormInput v-model.number="store.form_data.maxQuantity" size="md" type="number" required />
                        </CCol>
                    </CRow>

                    <CRow class="mb-3">
                        <CCol :md="6">
                            <CFormLabel>1인 최소 수량</CFormLabel>
                            <CFormInput v-model.number="store.form_data.minPerUser" size="md" type="number" required />
                        </CCol>
                        <CCol :md="6">
                            <CFormLabel>1인 최대 수량</CFormLabel>
                            <CFormInput v-model.number="store.form_data.maxPerUser" size="md" type="number" required />
                        </CCol>
                    </CRow>

                    <CRow class="mb-3">
                        <CCol :md="6">
                            <CFormLabel>시작일시</CFormLabel>
                            <CFormInput v-model="store.form_data.startAt" size="md" type="datetime-local" required />
                        </CCol>
                        <CCol :md="6">
                            <CFormLabel>마감일시</CFormLabel>
                            <CFormInput v-model="store.form_data.endAt" size="md" type="datetime-local" required />
                        </CCol>
                    </CRow>

                    <div class="mb-3">
                        <CFormLabel>배송 예정일</CFormLabel>
                        <CFormInput v-model="store.form_data.deliveryDate" size="md" type="date" required />
                    </div>

                    <div class="d-flex gap-2">
                        <CButton type="submit" color="primary" size="md" :disabled="is_submitting">
                            {{ is_submitting ? "등록 중..." : "등록" }}
                        </CButton>
                        <CButton color="light" size="md" @click="router.push('/groupbuy/list')">
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
import{useRouter}from"vue-router";
import{CRow, CCol, CCard, CCardBody, CForm, CFormInput, CFormLabel, CButton}from"@coreui/vue";
import{useGroupbuyStore}from"../../pinia/groupbuy.js";
import{create_groupbuy}from"../../api/groupbuy.js";
import{fetch_product}from"../../api/product.js";

const router = useRouter();
const store = useGroupbuyStore();

const is_fetching = ref(false);
const is_submitting = ref(false);

onMounted(()=>{
    store.reset_form();
});

const handle_fetch_product = async()=>{
    if(!store.form_data.productUrl){
        alert("상품 URL을 입력하세요.");
        return;
    }
    is_fetching.value = true;
    try{
        const res = await fetch_product(store.form_data.productUrl);
        const product = res.data;
        store.set_form({
            productName: product.productName || "",
            productImageUrl: product.productImageUrl || "",
            importerName: product.importerName || "",
            originalPrice: product.originalPrice || 0,
            productDescription: product.productDescription || ""
        });
    }catch(e){
        console.error(e);
    }finally{
        is_fetching.value = false;
    }
};

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
        await create_groupbuy(payload);
        alert("공동구매가 등록되었습니다.");
        store.reset_form();
        router.push("/groupbuy/list");
    }catch(e){
        console.error(e);
    }finally{
        is_submitting.value = false;
    }
};
</script>

<style scoped lang="sass">
</style>
