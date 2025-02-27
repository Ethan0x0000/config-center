<template>
  <div class="node-page">
    <div>
      <NodeManage />
    </div>
    <div>
      <SubNode />
    </div>
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

<style scoped>
.node-page {
  display: flex;
  flex-direction: column;
  margin: 20px;
  justify-content: space-between;
}
</style>
