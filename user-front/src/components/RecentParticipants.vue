<template>
  <div class="recent-participants" v-if="participants && participants.length > 0">
    <div
      class="participant-item"
      v-for="(item, idx) in participants.slice(0, 3)"
      :key="idx"
    >
      <span class="participant-item__icon">&#128293;</span>
      <span class="participant-item__name">{{ mask_name(item.displayName) }}</span>
      <span class="participant-item__time">{{ time_ago(item.createdAt) }} 참여</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  participants: { type: Array, default: ()=>[] }
});

const mask_name = (name)=>{
  if(!name) return "***";
  if(name.length <= 2) return name[0] + "**";
  return name.substring(0, 2) + "**";
};

const time_ago = (date_str)=>{
  if(!date_str) return "";
  const now = Date.now();
  const past = new Date(date_str).getTime();
  const diff_ms = now - past;
  const diff_min = Math.floor(diff_ms / 60000);

  if(diff_min < 1) return "방금";
  if(diff_min < 60) return `${diff_min}분 전`;
  const diff_hour = Math.floor(diff_min / 60);
  if(diff_hour < 24) return `${diff_hour}시간 전`;
  const diff_day = Math.floor(diff_hour / 24);
  return `${diff_day}일 전`;
};
</script>

<style scoped>
.recent-participants{
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.participant-item{
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.2rem;
  color: var(--color-text-muted);
}

.participant-item__icon{
  font-size: 1.3rem;
}

.participant-item__name{
  font-weight: 600;
  color: var(--color-text);
}

.participant-item__time{
  color: var(--color-text-muted);
}
</style>
