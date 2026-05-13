<template>
  <div class="progress-wrapper">
    <div class="progress-bar">
      <div class="progress-bar__fill" :style="{ width: percentage + '%' }"></div>
    </div>
    <span class="progress-text">{{ percentage }}%</span>
  </div>
</template>

<script setup>
import{computed}from"vue";

const props = defineProps({
  current: { type: Number, required: true },
  target: { type: Number, required: true }
});

const percentage = computed(()=>{
  if(props.target <= 0) return 0;
  const pct = Math.round((props.current / props.target) * 100);
  return Math.min(pct, 100);
});
</script>

<style scoped>
.progress-wrapper{
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.progress-bar{
  flex: 1;
}

.progress-text{
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-accent);
  min-width: 3.6rem;
  text-align: right;
}
</style>
