<script setup lang="ts">
import { useRoute } from 'vue-router';
import ChecklistPanel from '@/pages/ChecklistPanel.vue';
import WorkOrderAttachments from '@/components/WorkOrderAttachments.vue';

const id = Number(useRoute().params.id);
</script>

<template>
  <section class="p-6">
    <h1 class="text-xl mb-3">İş Emri #{{ id }}</h1>
    <div class="grid gap-4 md:grid-cols-2">
      <ChecklistPanel :workOrderId="id" />
      <WorkOrderAttachments :workOrderId="id" />
    </div>
  </section>
</template>
