import{ref, onUnmounted}from"vue";

export const usePolling = (fn, interval = 5000)=>{
  const data = ref(null);
  const loading = ref(false);
  let timer_id = null;

  const execute = async()=>{
    loading.value = true;
    try{
      const result = await fn();
      data.value = result;
    }catch(e){
      console.error("Polling error:", e);
    }finally{
      loading.value = false;
    }
  };

  const start = ()=>{
    if(timer_id) return;
    execute();
    timer_id = setInterval(execute, interval);
  };

  const stop = ()=>{
    if(timer_id){
      clearInterval(timer_id);
      timer_id = null;
    }
  };

  onUnmounted(()=>{
    stop();
  });

  return { data, loading, start, stop };
};
