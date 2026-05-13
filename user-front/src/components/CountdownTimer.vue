<template>
  <div class="countdown" :class="{ 'countdown--expired': is_expired }">
    <template v-if="!is_expired">
      <span class="countdown__icon">&#9200;</span>
      <span class="countdown__text">마감까지 {{ formatted }}</span>
    </template>
    <template v-else>
      <span class="countdown__text countdown__text--expired">마감됨</span>
    </template>
  </div>
</template>

<script setup>
import{computed}from"vue";
import{useCountdown}from"../composables/useCountdown.js";

const props = defineProps({
  endAt: { type: String, required: true }
});

const { days, hours, minutes, is_expired } = useCountdown(props.endAt);

const formatted = computed(()=>{
  const parts = [];
  if(days.value > 0) parts.push(`${days.value}일`);
  parts.push(`${hours.value}시간`);
  parts.push(`${minutes.value}분`);
  return parts.join(" ");
});
</script>

<style scoped>
.countdown{
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.2rem;
  color: var(--color-primary);
  font-weight: 600;
}

.countdown--expired{
  color: var(--color-text-muted);
}

.countdown__icon{
  font-size: 1.4rem;
}

.countdown__text--expired{
  color: var(--color-text-muted);
}
</style>
