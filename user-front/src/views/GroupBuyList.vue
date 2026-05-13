<template>
  <div class="groupbuy-list">
    <header class="list-header">
      <h1 class="list-header__title">공동구매</h1>
      <p class="list-header__subtitle">함께 모여 더 좋은 가격으로</p>
    </header>

    <div v-if="is_loading" class="loading-state">
      <p>불러오는 중...</p>
    </div>

    <div v-else-if="list.length === 0" class="empty-state">
      <div class="empty-state__icon">&#128722;</div>
      <p>현재 진행 중인 공구가 없습니다</p>
    </div>

    <div v-else class="card-grid">
      <router-link
        v-for="item in list"
        :key="item.id"
        :to="`/groupbuy/${item.id}`"
        class="card groupbuy-card"
      >
        <div class="groupbuy-card__image">
          <img
            :src="item.productImageUrl || '/placeholder-wine.png'"
            :alt="item.productName"
          />
        </div>
        <div class="groupbuy-card__body">
          <h3 class="groupbuy-card__name">{{ item.productName }}</h3>
          <div class="groupbuy-card__price">
            <span class="price-original">{{ format_price(item.originalPrice) }}원</span>
            <span class="price-discount">{{ discount_percent(item) }}%</span>
            <span class="price-current">{{ format_price(item.groupBuyPrice) }}원</span>
          </div>
          <ProgressBar :current="item.currentQuantity" :target="item.targetQuantity" />
          <div class="groupbuy-card__footer">
            <CountdownTimer :endAt="item.endAt" />
            <span class="participant-count">&#128101; {{ item.participantCount || 0 }}명</span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import{ref, onMounted}from"vue";
import{fetch_groupbuy_list}from"../api/groupbuy.js";
import ProgressBar from"../components/ProgressBar.vue";
import CountdownTimer from"../components/CountdownTimer.vue";

const list = ref([]);
const is_loading = ref(true);

const format_price = (price)=>{
  if(!price) return "0";
  return price.toLocaleString("ko-KR");
};

const discount_percent = (item)=>{
  if(!item.originalPrice || !item.groupBuyPrice) return 0;
  return Math.round(((item.originalPrice - item.groupBuyPrice) / item.originalPrice) * 100);
};

onMounted(async()=>{
  try{
    const data = await fetch_groupbuy_list();
    list.value = Array.isArray(data) ? data : (data?.list || data?.items || []);
  }catch(e){
    console.error("Failed to fetch list:", e);
  }finally{
    is_loading.value = false;
  }
});
</script>

<style scoped>
.list-header{
  padding: 2.4rem 0 1.6rem;
}

.list-header__title{
  font-size: 2.4rem;
  font-weight: 800;
}

.list-header__subtitle{
  font-size: 1.3rem;
  color: var(--color-text-muted);
  margin-top: 0.4rem;
}

.loading-state{
  display: flex;
  justify-content: center;
  padding: 4rem 0;
  color: var(--color-text-muted);
}

.card-grid{
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  padding-bottom: 2rem;
}

.groupbuy-card{
  display: block;
  transition: transform 0.15s;
}

.groupbuy-card:active{
  transform: scale(0.98);
}

.groupbuy-card__image{
  width: 100%;
  height: 18rem;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.groupbuy-card__image img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.groupbuy-card__body{
  padding: 1.4rem 1.6rem 1.6rem;
}

.groupbuy-card__name{
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.groupbuy-card__price{
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.price-original{
  font-size: 1.2rem;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.price-discount{
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-primary);
}

.price-current{
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text);
}

.groupbuy-card__footer{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
}

.participant-count{
  font-size: 1.2rem;
  color: var(--color-text-muted);
}
</style>
