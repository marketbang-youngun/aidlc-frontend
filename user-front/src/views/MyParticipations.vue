<template>
  <div class="my-page">
    <header class="my-header">
      <h1 class="my-header__title">내 참여 내역</h1>
    </header>

    <div class="my-search">
      <input
        type="email"
        class="my-search__input"
        v-model="email"
        placeholder="이메일을 입력하세요"
        @keyup.enter="handle_search"
      />
      <button class="my-search__btn" @click="handle_search" :disabled="!email.trim()">조회</button>
    </div>

    <div v-if="is_loading" class="loading-state">
      <p>조회 중...</p>
    </div>

    <div v-else-if="has_searched && participations.length === 0" class="empty-state">
      <div class="empty-state__icon">&#128196;</div>
      <p>참여 내역이 없습니다</p>
    </div>

    <div v-else-if="participations.length > 0" class="participation-list">
      <router-link
        v-for="item in participations"
        :key="item.id || item.groupBuyId"
        :to="`/groupbuy/${item.groupBuyId}`"
        class="card participation-card"
      >
        <div class="participation-card__body">
          <div class="participation-card__top">
            <h3 class="participation-card__title">{{ item.productName || item.title }}</h3>
            <span class="badge" :class="badge_class(item.status)">{{ status_label(item.status) }}</span>
          </div>
          <div class="participation-card__info">
            <span>수량: {{ item.quantity }}병</span>
            <span class="participation-card__amount">{{ format_price(item.expectedAmount || (item.quantity * item.price)) }}원</span>
          </div>
        </div>
      </router-link>
    </div>

    <p class="my-error" v-if="error_msg">{{ error_msg }}</p>
  </div>
</template>

<script setup>
import{ref}from"vue";
import{fetch_my_participations}from"../api/groupbuy.js";

const email = ref("");
const participations = ref([]);
const is_loading = ref(false);
const has_searched = ref(false);
const error_msg = ref("");

const handle_search = async()=>{
  if(!email.value.trim()) return;
  error_msg.value = "";
  is_loading.value = true;
  has_searched.value = true;
  try{
    const data = await fetch_my_participations(email.value.trim());
    participations.value = Array.isArray(data) ? data : (data?.list || data?.items || []);
  }catch(e){
    error_msg.value = e.message || "조회 중 오류가 발생했습니다";
    participations.value = [];
  }finally{
    is_loading.value = false;
  }
};

const format_price = (price)=>{
  if(!price) return "0";
  return price.toLocaleString("ko-KR");
};

const status_label = (status)=>{
  const labels = {
    "ACTIVE": "진행중",
    "CONFIRMED": "확정",
    "CANCELLED": "취소",
    "PENDING": "대기"
  };
  return labels[status] || status || "진행중";
};

const badge_class = (status)=>{
  const classes = {
    "ACTIVE": "badge--active",
    "CONFIRMED": "badge--confirmed",
    "CANCELLED": "badge--cancelled",
    "PENDING": "badge--pending"
  };
  return classes[status] || "badge--active";
};
</script>

<style scoped>
.my-header{
  padding: 2.4rem 0 1.6rem;
}

.my-header__title{
  font-size: 2.4rem;
  font-weight: 800;
}

.my-search{
  display: flex;
  gap: 0.8rem;
  margin-bottom: 2rem;
}

.my-search__input{
  flex: 1;
  height: 4.4rem;
  padding: 0 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: 0.8rem;
  font-size: 1.4rem;
  color: var(--color-text);
  background: #fff;
}

.my-search__input:focus{
  border-color: var(--color-primary);
}

.my-search__btn{
  height: 4.4rem;
  padding: 0 1.6rem;
  border-radius: 0.8rem;
  background: var(--color-primary);
  color: #fff;
  font-size: 1.4rem;
  font-weight: 700;
  white-space: nowrap;
}

.my-search__btn:disabled{
  background: var(--color-disabled);
}

.loading-state{
  display: flex;
  justify-content: center;
  padding: 4rem 0;
  color: var(--color-text-muted);
}

.participation-list{
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.participation-card{
  display: block;
  transition: transform 0.15s;
}

.participation-card:active{
  transform: scale(0.98);
}

.participation-card__body{
  padding: 1.4rem 1.6rem;
}

.participation-card__top{
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
}

.participation-card__title{
  font-size: 1.4rem;
  font-weight: 700;
  flex: 1;
  margin-right: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.participation-card__info{
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  color: var(--color-text-muted);
}

.participation-card__amount{
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-text);
}

.my-error{
  margin-top: 1.2rem;
  font-size: 1.2rem;
  color: var(--color-error);
  text-align: center;
}
</style>
