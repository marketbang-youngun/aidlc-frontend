<template>
  <nav class="bottom-nav">
    <router-link to="/" class="bottom-nav__item" :class="{ active: route.path === '/' }">
      <span class="bottom-nav__icon">&#127968;</span>
      <span class="bottom-nav__label">홈</span>
    </router-link>
    <router-link to="/my" class="bottom-nav__item" :class="{ active: route.path === '/my' }">
      <span class="bottom-nav__icon">&#128100;</span>
      <span class="bottom-nav__label">내 참여</span>
    </router-link>
  </nav>
</template>

<script setup>
import{useRoute}from"vue-router";

const route = useRoute();
</script>

<style scoped>
.bottom-nav{
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 5.6rem;
  background: #fff;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  z-index: 900;
  max-width: 600px;
  margin: 0 auto;
}

.bottom-nav__item{
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  text-decoration: none;
  color: var(--color-text-muted);
  transition: color 0.2s;
}

.bottom-nav__item.active{
  color: var(--color-accent);
}

.bottom-nav__icon{
  font-size: 2rem;
}

.bottom-nav__label{
  font-size: 1rem;
  font-weight: 600;
}
</style>
