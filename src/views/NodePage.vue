<template>
  <div>
    <NodeManage />
  </div>
  <div>
    <SubNode />
  </div>
</template>

<script setup>
import NodeManage from '@/components/NodeManage.vue';
import SubNode from '@/components/SubNode.vue';


import { onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

onMounted(() => {
  store.dispatch('profile/initProfile');
})

</script>
