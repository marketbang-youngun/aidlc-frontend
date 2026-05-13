<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="isOpen" @click.self="handle_close">
      <div class="modal-content">
        <template v-if="!is_success">
          <h3 class="modal-title">공동구매 참여</h3>

          <div class="modal-field">
            <label class="modal-label">이메일</label>
            <input
              type="email"
              class="modal-input"
              v-model="email"
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div class="modal-field">
            <label class="modal-label">수량</label>
            <div class="qty-selector">
              <button class="qty-btn" @click="decrease_qty" :disabled="quantity <= min_qty">-</button>
              <span class="qty-value">{{ quantity }}</span>
              <button class="qty-btn" @click="increase_qty" :disabled="quantity >= max_qty">+</button>
            </div>
            <p class="modal-hint">최소 {{ min_qty }}병 ~ 최대 {{ max_qty }}병</p>
          </div>

          <div class="modal-amount">
            <span class="modal-amount__label">예상 결제 금액</span>
            <span class="modal-amount__value">{{ formatted_amount }}원</span>
          </div>

          <p class="modal-error" v-if="error_msg">{{ error_msg }}</p>

          <button
            class="btn-primary"
            :class="{ 'btn-disabled': !is_valid || is_loading }"
            :disabled="!is_valid || is_loading"
            @click="handle_submit"
          >
            {{ is_loading ? "처리 중..." : "참여 확인" }}
          </button>

          <button class="modal-close-btn" @click="handle_close">취소</button>
        </template>

        <template v-else>
          <div class="modal-success">
            <div class="modal-success__icon">&#10004;</div>
            <h3 class="modal-success__title">참여 완료!</h3>
            <p class="modal-success__text">
              공동구매 참여가 완료되었습니다.<br />
              결제는 데모용으로 처리되었습니다.
            </p>
            <button class="btn-primary mt-4" @click="handle_close_success">확인</button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import{ref, computed}from"vue";
import{join_groupbuy}from"../api/groupbuy.js";

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  groupBuy: { type: Object, default: ()=>({}) }
});

const emit = defineEmits(["close", "success"]);

const email = ref("");
const display_name = ref("");
const quantity = ref(1);
const is_loading = ref(false);
const is_success = ref(false);
const error_msg = ref("");

const min_qty = computed(()=>props.groupBuy?.minPerUser || 1);
const max_qty = computed(()=>props.groupBuy?.maxPerUser || 99);
const price = computed(()=>props.groupBuy?.groupBuyPrice || props.groupBuy?.price || 0);

const expected_amount = computed(()=>quantity.value * price.value);

const formatted_amount = computed(()=>{
  return expected_amount.value.toLocaleString("ko-KR");
});

const is_valid = computed(()=>{
  return email.value.trim() !== "" && quantity.value >= min_qty.value && quantity.value <= max_qty.value;
});

const decrease_qty = ()=>{
  if(quantity.value > min_qty.value){
    quantity.value--;
  }
};

const increase_qty = ()=>{
  if(quantity.value < max_qty.value){
    quantity.value++;
  }
};

const handle_submit = async()=>{
  if(!is_valid.value || is_loading.value) return;
  error_msg.value = "";
  is_loading.value = true;
  try{
    await join_groupbuy(props.groupBuy.id, {
      email: email.value.trim(),
      displayName: email.value.trim().split("@")[0],
      quantity: quantity.value
    });
    is_success.value = true;
    emit("success");
  }catch(e){
    error_msg.value = e.message || "참여 처리 중 오류가 발생했습니다";
  }finally{
    is_loading.value = false;
  }
};

const handle_close = ()=>{
  reset_form();
  emit("close");
};

const handle_close_success = ()=>{
  reset_form();
  emit("close");
};

const reset_form = ()=>{
  email.value = "";
  display_name.value = "";
  quantity.value = 1;
  is_success.value = false;
  error_msg.value = "";
};
</script>

<style scoped>
.modal-overlay{
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding: 0 0 0 0;
}

.modal-content{
  background: #fff;
  border-radius: 1.6rem 1.6rem 0 0;
  width: 100%;
  max-width: 600px;
  padding: 2.4rem 2rem 3.2rem;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title{
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 2rem;
  text-align: center;
}

.modal-field{
  margin-bottom: 1.6rem;
}

.modal-label{
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 0.4rem;
}

.modal-input{
  width: 100%;
  height: 4.4rem;
  padding: 0 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: 0.8rem;
  font-size: 1.4rem;
  color: var(--color-text);
  background: #fff;
}

.modal-input:focus{
  border-color: var(--color-primary);
}

.modal-hint{
  font-size: 1.1rem;
  color: var(--color-text-muted);
  margin-top: 0.4rem;
}

.qty-selector{
  display: flex;
  align-items: center;
  gap: 1.6rem;
}

.qty-btn{
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  font-size: 1.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  background: #fff;
}

.qty-btn:disabled{
  color: var(--color-disabled);
  border-color: var(--color-disabled);
}

.qty-value{
  font-size: 2rem;
  font-weight: 800;
  min-width: 3rem;
  text-align: center;
}

.modal-amount{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  background: var(--color-section-bg);
  border-radius: 0.8rem;
  margin-bottom: 2rem;
}

.modal-amount__label{
  font-size: 1.3rem;
  color: var(--color-text-muted);
}

.modal-amount__value{
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-primary);
}

.modal-error{
  font-size: 1.2rem;
  color: var(--color-error);
  margin-bottom: 1.2rem;
  text-align: center;
}

.modal-close-btn{
  width: 100%;
  height: 4rem;
  margin-top: 1rem;
  font-size: 1.4rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.modal-success{
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  text-align: center;
}

.modal-success__icon{
  width: 5.6rem;
  height: 5.6rem;
  border-radius: 50%;
  background: #e8fad5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
  color: #2e7d00;
  margin-bottom: 1.6rem;
}

.modal-success__title{
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 0.8rem;
}

.modal-success__text{
  font-size: 1.3rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}
</style>
