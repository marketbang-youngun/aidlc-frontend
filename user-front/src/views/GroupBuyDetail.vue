<template>
  <div class="detail" v-if="group_buy">
    <div class="detail__image">
      <img :src="group_buy.productImageUrl || '/placeholder-wine.png'" :alt="group_buy.productName" />
      <button class="detail__back" @click="router.back()">&#8592;</button>
    </div>

    <div class="detail__content">
      <!-- Product Info -->
      <section class="detail-section">
        <h1 class="detail__name">{{ group_buy.productName }}</h1>
        <p class="detail__importer" v-if="group_buy.importerName">{{ group_buy.importerName }}</p>
      </section>

      <!-- Price Section -->
      <section class="detail-section">
        <div class="detail__price">
          <span class="price-original">&#8361;{{ format_price(group_buy.originalPrice) }}</span>
          <span class="price-arrow">&#8594;</span>
          <span class="price-label">공구가</span>
          <span class="price-current">&#8361;{{ format_price(group_buy.groupBuyPrice) }}</span>
        </div>
        <div class="price-discount">{{ discount_percent }}% 할인</div>
      </section>

      <!-- Progress Section -->
      <section class="detail-section">
        <ProgressBar :current="status_data.currentQuantity" :target="group_buy.targetQuantity" />
        <div class="detail__progress-info">
          <span>목표 {{ group_buy.targetQuantity }}병 / 현재 {{ status_data.currentQuantity }}병</span>
          <span>참여자 {{ status_data.participantCount }}명</span>
        </div>
      </section>

      <!-- Countdown & Social Proof -->
      <section class="detail-section" v-if="group_buy.endAt && is_recruiting">
        <div class="detail__countdown">
          <span class="countdown-icon">&#9200;</span>
          <CountdownTimer :endAt="group_buy.endAt" />
        </div>
        <div class="detail__social-proof" v-if="status_data.participantCount > 0">
          <span class="social-proof-text">{{ social_proof_text }}</span>
        </div>
      </section>

      <!-- Recent Participants Feed -->
      <section class="detail-section" v-if="status_data.recentParticipants && status_data.recentParticipants.length > 0">
        <div class="detail__recent-header">
          <span class="recent-icon">&#128293;</span>
          <span class="recent-label">최근 참여</span>
        </div>
        <RecentParticipants :participants="status_data.recentParticipants" />
      </section>

      <!-- Status Messages -->
      <section class="detail-section" v-if="status_data.status === 'CONFIRMED'">
        <div class="status-message status-message--confirmed">
          &#10004; 이 공동구매는 목표 수량을 달성하여 확정되었습니다.
        </div>
      </section>

      <section class="detail-section" v-if="status_data.status === 'AUTO_CANCELLED'">
        <div class="status-message status-message--cancelled">
          &#10060; 이 공동구매는 목표 수량 미달로 자동 취소되었습니다.
        </div>
      </section>

      <section class="detail-section" v-if="status_data.status === 'MANUAL_CANCELLED'">
        <div class="status-message status-message--cancelled">
          &#10060; 이 공동구매는 운영자에 의해 취소되었습니다.
        </div>
      </section>

      <!-- Participation Form (RECRUITING only) -->
      <section class="detail-section" v-if="is_recruiting && !is_success">
        <h3 class="section-title">참여 신청</h3>

        <div class="form-field">
          <label class="form-label">이메일</label>
          <input
            type="email"
            class="form-input"
            :class="{'form-input--error': email.trim() !== '' && !is_email_valid}"
            v-model="email"
            placeholder="이메일을 입력하세요"
          />
          <p class="form-error-hint" v-if="email.trim() !== '' && !is_email_valid">올바른 이메일 형식을 입력해주세요</p>
        </div>

        <div class="form-field">
          <label class="form-label">수량</label>
          <div class="qty-selector">
            <button class="qty-btn" @click="decrease_qty" :disabled="selected_qty <= min_qty">-</button>
            <span class="qty-value">{{ selected_qty }}</span>
            <button class="qty-btn" @click="increase_qty" :disabled="selected_qty >= max_qty">+</button>
          </div>
          <p class="form-hint">최소 {{ min_qty }}병 ~ 최대 {{ max_qty }}병</p>
        </div>

        <div class="expected-amount">
          <span>예상 결제 금액</span>
          <span class="expected-amount__value">&#8361;{{ format_price(expected_total) }}</span>
        </div>

        <p class="detail__notice">
          공구 확정 시 &#8361;{{ format_price(expected_total) }} 결제 예정 / 미달 시 결제되지 않습니다
        </p>

        <p class="form-error" v-if="error_msg">{{ error_msg }}</p>

        <button
          class="btn-cta"
          :class="{'btn-cta--disabled': !is_valid || is_submitting}"
          :disabled="!is_valid || is_submitting"
          @click="handle_submit"
        >
          {{ is_submitting ? "처리 중..." : "참여하기" }}
        </button>
      </section>

      <!-- Success Message -->
      <section class="detail-section" v-if="is_success">
        <div class="success-box">
          <div class="success-box__icon">&#10004;</div>
          <h3 class="success-box__title">참여 완료!</h3>
          <p class="success-box__text">
            결제는 데모용으로 처리되었습니다.<br />
            실제 서비스에서는 목표 수량 달성 시 결제가 진행됩니다.
          </p>
          <button class="btn-cta" @click="reset_form">추가 참여하기</button>
        </div>
      </section>
    </div>
  </div>

  <div v-else-if="is_loading" class="loading-state">
    <p>불러오는 중...</p>
  </div>

  <div v-else class="empty-state">
    <p>공동구매를 찾을 수 없습니다</p>
  </div>
</template>

<script setup>
import{ref, computed, onMounted}from"vue";
import{useRoute, useRouter}from"vue-router";
import{fetch_groupbuy_detail, fetch_groupbuy_status, join_groupbuy}from"../api/groupbuy.js";
import{usePolling}from"../composables/usePolling.js";
import ProgressBar from"../components/ProgressBar.vue";
import CountdownTimer from"../components/CountdownTimer.vue";
import RecentParticipants from"../components/RecentParticipants.vue";

const route = useRoute();
const router = useRouter();

const group_buy = ref(null);
const is_loading = ref(true);
const selected_qty = ref(1);
const email = ref("");
const is_submitting = ref(false);
const is_success = ref(false);
const error_msg = ref("");

const group_buy_id = computed(()=>route.params.id);

const min_qty = computed(()=>group_buy.value?.minPerUser || 1);
const max_qty = computed(()=>group_buy.value?.maxPerUser || 99);

const is_recruiting = computed(()=>status_data.value.status === "RECRUITING");

const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const is_email_valid = computed(()=>email_regex.test(email.value.trim()));
const is_valid = computed(()=>is_email_valid.value && selected_qty.value >= min_qty.value && selected_qty.value <= max_qty.value);

const discount_percent = computed(()=>{
  if(!group_buy.value?.originalPrice || !group_buy.value?.groupBuyPrice) return 0;
  return Math.round(((group_buy.value.originalPrice - group_buy.value.groupBuyPrice) / group_buy.value.originalPrice) * 100);
});

const expected_total = computed(()=>selected_qty.value * (group_buy.value?.groupBuyPrice || 0));

const social_proof_text = computed(()=>{
  const count = status_data.value.participantCount;
  if(count <= 0) return "";
  const recent = status_data.value.recentParticipants;
  if(recent && recent.length > 0){
    const name = recent[0].displayName || recent[0].name || "참여자";
    if(count > 1){
      return `${name}님 외 ${count - 1}명 참여중`;
    }
    return `${name}님 참여중`;
  }
  return `${count}명 참여중`;
});

const { data: polling_data, start: start_polling } = usePolling(
  ()=>fetch_groupbuy_status(group_buy_id.value),
  5000
);

const status_data = computed(()=>{
  if(polling_data.value){
    return polling_data.value;
  }
  return {
    currentQuantity: group_buy.value?.currentQuantity || 0,
    participantCount: group_buy.value?.participantCount || 0,
    status: group_buy.value?.status || "RECRUITING",
    recentParticipants: group_buy.value?.participants || []
  };
});

const format_price = (price)=>{
  if(!price) return "0";
  return price.toLocaleString("ko-KR");
};

const decrease_qty = ()=>{
  if(selected_qty.value > min_qty.value){
    selected_qty.value--;
  }
};

const increase_qty = ()=>{
  if(selected_qty.value < max_qty.value){
    selected_qty.value++;
  }
};

const handle_submit = async()=>{
  if(!is_valid.value || is_submitting.value) return;
  error_msg.value = "";
  is_submitting.value = true;
  try{
    await join_groupbuy(group_buy_id.value, {
      email: email.value.trim(),
      displayName: email.value.trim().split("@")[0],
      quantity: selected_qty.value
    });
    is_success.value = true;
    start_polling();
  }catch(e){
    error_msg.value = e.message || "참여 처리 중 오류가 발생했습니다";
  }finally{
    is_submitting.value = false;
  }
};

const reset_form = ()=>{
  email.value = "";
  selected_qty.value = min_qty.value;
  is_success.value = false;
  error_msg.value = "";
};

onMounted(async()=>{
  try{
    const data = await fetch_groupbuy_detail(group_buy_id.value);
    group_buy.value = data;
    selected_qty.value = data.minPerUser || 1;
    start_polling();
  }catch(e){
    console.error("Failed to fetch detail:", e);
  }finally{
    is_loading.value = false;
  }
});
</script>

<style scoped>
.detail{
  font-family: "Pretendard", -apple-system, sans-serif;
}

.detail__image{
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  max-height: 40rem;
  overflow: hidden;
  background: #f5f5f5;
  margin: 0 -2rem;
  width: calc(100% + 4rem);
}

.detail__image img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail__back{
  position: absolute;
  top: 1.2rem;
  left: 1.2rem;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: var(--color-text);
  box-shadow: var(--shadow-card);
  border: none;
  cursor: pointer;
}

.detail__content{
  padding-top: 2rem;
}

.detail-section{
  padding: 1.6rem 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-section:last-child{
  border-bottom: none;
}

.detail-section--cta{
  padding-bottom: 3.2rem;
}

.detail__name{
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 0.4rem;
  line-height: 1.3;
}

.detail__importer{
  font-size: 1.3rem;
  color: var(--color-text-muted);
}

.detail__price{
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.price-original{
  font-size: 1.3rem;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.price-arrow{
  font-size: 1.3rem;
  color: var(--color-text-muted);
}

.price-label{
  font-size: 1.3rem;
  color: var(--color-primary);
  font-weight: 600;
}

.price-current{
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--color-text);
}

.price-discount{
  margin-top: 0.4rem;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-primary);
}

.detail__progress-info{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.8rem;
  font-size: 1.2rem;
  color: var(--color-text-muted);
}

.detail__countdown{
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-text);
}

.countdown-icon{
  font-size: 1.6rem;
}

.detail__social-proof{
  margin-top: 0.8rem;
}

.social-proof-text{
  font-size: 1.3rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.detail__recent-header{
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.recent-icon{
  font-size: 1.4rem;
}

.recent-label{
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
}

.section-title{
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1rem;
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
  cursor: pointer;
}

.qty-btn:disabled{
  color: var(--color-disabled);
  border-color: var(--color-disabled);
  cursor: not-allowed;
}

.qty-value{
  font-size: 2rem;
  font-weight: 800;
  min-width: 3rem;
  text-align: center;
}

.expected-amount{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.2rem;
  padding: 1.2rem;
  background: var(--color-section-bg);
  border-radius: 0.8rem;
  font-size: 1.3rem;
  color: var(--color-text-muted);
}

.expected-amount__value{
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-primary);
}

.detail__notice{
  margin-top: 1rem;
  font-size: 1.1rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.btn-cta{
  width: 100%;
  height: 4.8rem;
  background: var(--color-primary);
  color: #fff;
  font-size: 1.8rem;
  font-weight: 800;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-cta:active{
  opacity: 0.85;
}

.btn-cta--disabled{
  background: var(--color-disabled);
  cursor: not-allowed;
}

.form-field{
  margin-bottom: 1.6rem;
}

.form-label{
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 0.4rem;
}

.form-input{
  width: 100%;
  height: 4.4rem;
  padding: 0 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: 0.8rem;
  font-size: 1.4rem;
  color: var(--color-text);
  background: #fff;
  box-sizing: border-box;
}

.form-input:focus{
  outline: none;
  border-color: var(--color-primary);
}

.form-input--error{
  border-color: var(--color-error);
}

.form-error-hint{
  font-size: 1.1rem;
  color: var(--color-error);
  margin-top: 0.4rem;
}

.form-hint{
  font-size: 1.1rem;
  color: var(--color-text-muted);
  margin-top: 0.4rem;
}

.form-error{
  font-size: 1.2rem;
  color: var(--color-error);
  margin: 1rem 0;
}

.success-box{
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  text-align: center;
}

.success-box__icon{
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

.success-box__title{
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 0.8rem;
}

.success-box__text{
  font-size: 1.3rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.status-message{
  padding: 1.2rem;
  border-radius: 0.8rem;
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1.5;
}

.status-message--confirmed{
  background: #e0f0ff;
  color: #0059b2;
}

.status-message--cancelled{
  background: #ffe8e6;
  color: var(--color-error);
}

.loading-state{
  display: flex;
  justify-content: center;
  padding: 4rem 0;
  color: var(--color-text-muted);
  font-size: 1.4rem;
}

.empty-state{
  display: flex;
  justify-content: center;
  padding: 4rem 0;
  color: var(--color-text-muted);
  font-size: 1.4rem;
}
</style>
