<template>
  <v-timeline align-top dense>
    <v-timeline-item color="pink" small v-for="item in layout" :key="item.type">
      <template v-slot:opposite>
        <i v-if="Date.now() < (new Date(item.startDate)).getTime()"><strong>FUTURE</strong> ({{ item.startDate }})</i>
        <i v-else>
          {{ item.startDate }} -
          <span v-if="item.endDate">{{ item.endDate }}</span>
          <span v-else><strong>Now</strong></span>
        </i>
      </template>
      <template v-slot:icon>
        <span>JL</span>
      </template>
      <v-layout pt-3>
        <v-flex>
          <strong>{{ item.company }}</strong>
          <div class="caption">{{ item.role }}</div>
        </v-flex>
      </v-layout>
    </v-timeline-item>
  </v-timeline>
</template>

<script>
import { layout } from '@/static/timeline.json';

export default {
  data() {
    return {
      year: (new Date()).getFullYear(),
      layout: layout.filter(x => x.type === 'item'),
    };
  },
};
</script>
