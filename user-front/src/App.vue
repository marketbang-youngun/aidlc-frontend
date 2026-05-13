<template>
  <div class="app-wrapper">
    <div class="container">
      <router-view />
    </div>
    <BottomNav />
  </div>
</template>

<script setup>
import BottomNav from"./components/BottomNav.vue";
</script>

<style scoped>
.app-wrapper{
  min-height: 100vh;
  padding-bottom: 6rem;
  background: var(--color-section-bg);
}
</style>
