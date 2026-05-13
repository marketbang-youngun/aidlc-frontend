<template>
  <div class="detail" v-if="group_buy">
    <div class="detail__image">
      <img :src="group_buy.productImageUrl || '/placeholder-wine.png'" :alt="group_buy.productName" />
      <button class="detail__back" @click="router.back()">&#8592;</button>
    </div>

    <div class="detail__content">
      <!-- Product Info -->
      <section class="detail-section">
        <p class="detail__importer" v-if="group_buy.importerName">{{ group_buy.importerName }}</p>
        <h1 class="detail__name">{{ group_buy.productName }}</h1>
        <div class="detail__price">
          <span class="price-original">{{ format_price(group_buy.originalPrice) }}원</span>
          <span class="price-discount">{{ discount_percent }}%</span>
          <span class="price-current">{{ format_price(group_buy.groupBuyPrice) }}원</span>
        </div>
      </section>

      <!-- Progress Section -->
      <section class="detail-section">
        <ProgressBar :current="status_data.currentQuantity" :target="group_buy.targetQuantity" />
        <div class="detail__progress-info">
          <span>목표 {{ group_buy.targetQuantity }}병 / 현재 {{ status_data.currentQuantity }}병</span>
          <span>참여자 {{ status_data.participantCount }}명</span>
        </div>
      </section>

      <!-- Countdown -->
      <section class="detail-section" v-if="group_buy.endAt">
        <CountdownTimer :endAt="group_buy.endAt" />
      </section>

      <!-- Recent Participants -->
      <section class="detail-section" v-if="status_data.recentParticipants && status_data.recentParticipants.length > 0">
        <h3 class="section-title">최근 참여</h3>
        <RecentParticipants :participants="status_data.recentParticipants" />
      </section>

      <!-- Status Messages -->
      <section class="detail-section" v-if="status_data.status === 'CONFIRMED'">
        <div class="status-message status-message--confirmed">
          &#10004; 이 공동구매는 목표 수량을 달성하여 확정되었습니다.
        </div>
      </section>

      <section class="detail-section" v-if="status_data.status === 'CANCELLED'">
        <div class="status-message status-message--cancelled">
          &#10060; 이 공동구매는 취소되었습니다.
        </div>
      </section>

      <!-- Quantity Selector -->
      <section class="detail-section" v-if="status_data.status === 'ACTIVE'">
        <h3 class="section-title">수량 선택</h3>
        <div class="qty-selector">
          <button class="qty-btn" @click="decrease_qty" :disabled="selected_qty <= min_qty">-</button>
          <span class="qty-value">{{ selected_qty }}</span>
          <button class="qty-btn" @click="increase_qty" :disabled="selected_qty >= max_qty">+</button>
        </div>
        <div class="expected-amount">
          <span>예상 금액</span>
          <span class="expected-amount__value">{{ format_price(selected_qty * group_buy.groupBuyPrice) }}원</span>
        </div>
      </section>

      <!-- CTA Button -->
      <section class="detail-section" v-if="status_data.status === 'ACTIVE'">
        <button class="btn-primary" @click="show_modal = true">참여하기</button>
      </section>
    </div>

    <!-- Participation Modal -->
    <ParticipationModal
      :isOpen="show_modal"
      :groupBuy="modal_group_buy"
      @close="show_modal = false"
      @success="on_participation_success"
    />
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
import{fetch_groupbuy_detail, fetch_groupbuy_status}from"../api/groupbuy.js";
import{usePolling}from"../composables/usePolling.js";
import ProgressBar from"../components/ProgressBar.vue";
import CountdownTimer from"../components/CountdownTimer.vue";
import RecentParticipants from"../components/RecentParticipants.vue";
import ParticipationModal from"../components/ParticipationModal.vue";

const route = useRoute();
const router = useRouter();

const group_buy = ref(null);
const is_loading = ref(true);
const show_modal = ref(false);
const selected_qty = ref(1);

const group_buy_id = computed(()=>route.params.id);

const min_qty = computed(()=>group_buy.value?.minPerUser || 1);
const max_qty = computed(()=>group_buy.value?.maxPerUser || 99);

const discount_percent = computed(()=>{
  if(!group_buy.value?.originalPrice || !group_buy.value?.groupBuyPrice) return 0;
  return Math.round(((group_buy.value.originalPrice - group_buy.value.groupBuyPrice) / group_buy.value.originalPrice) * 100);
});

const modal_group_buy = computed(()=>({
  id: group_buy_id.value,
  price: group_buy.value?.groupBuyPrice || 0,
  groupBuyPrice: group_buy.value?.groupBuyPrice || 0,
  minPerUser: min_qty.value,
  maxPerUser: max_qty.value
}));

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
    status: group_buy.value?.status || "ACTIVE",
    recentParticipants: group_buy.value?.recentParticipants || []
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

const on_participation_success = ()=>{
  start_polling();
};

onMounted(async()=>{
  try{
    const data = await fetch_groupbuy_detail(group_buy_id.value);
    group_buy.value = data;
    start_polling();
  }catch(e){
    console.error("Failed to fetch detail:", e);
  }finally{
    is_loading.value = false;
  }
});
</script>

<style scoped>
.detail__image{
  position: relative;
  width: 100%;
  height: 28rem;
  overflow: hidden;
  background: #f5f5f5;
  margin: 0 -20px;
  width: calc(100% + 40px);
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
}

.detail__content{
  padding-top: 2rem;
}

.detail-section{
  padding: 1.2rem 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-section:last-child{
  border-bottom: none;
}

.detail__importer{
  font-size: 1.2rem;
  color: var(--color-text-muted);
  margin-bottom: 0.4rem;
}

.detail__name{
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.8rem;
}

.detail__price{
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.price-original{
  font-size: 1.3rem;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.price-discount{
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-primary);
}

.price-current{
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-text);
}

.detail__progress-info{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.8rem;
  font-size: 1.2rem;
  color: var(--color-text-muted);
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

.status-message{
  padding: 1.2rem;
  border-radius: 0.8rem;
  font-size: 1.3rem;
  font-weight: 600;
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
}
</style>
