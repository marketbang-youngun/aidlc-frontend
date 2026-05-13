import{ref, computed, onMounted, onUnmounted}from"vue";

export const useCountdown = (end_at)=>{
  const now = ref(Date.now());
  let timer_id = null;

  const end_time = computed(()=>new Date(end_at).getTime());

  const diff = computed(()=>{
    const remaining = end_time.value - now.value;
    return remaining > 0 ? remaining : 0;
  });

  const days = computed(()=>Math.floor(diff.value / (1000 * 60 * 60 * 24)));
  const hours = computed(()=>Math.floor((diff.value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minutes = computed(()=>Math.floor((diff.value % (1000 * 60 * 60)) / (1000 * 60)));
  const seconds = computed(()=>Math.floor((diff.value % (1000 * 60)) / 1000));
  const is_expired = computed(()=>diff.value <= 0);

  onMounted(()=>{
    timer_id = setInterval(()=>{
      now.value = Date.now();
    }, 1000);
  });

  onUnmounted(()=>{
    if(timer_id){
      clearInterval(timer_id);
    }
  });

  return { days, hours, minutes, seconds, is_expired };
};
