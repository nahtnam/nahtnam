<template>
  <div class="timeline">
    <header class="timeline-header">
      <span class="tag is-medium is-primary">{{ year + 1 }}</span>
    </header>
    <div v-for="item in layout" :key="item.text || item.company">
      <header v-if="item.type === 'tag'" class="timeline-header">
        <span class="tag" :class="[item.color, item.size].join(' ')">{{ item.text }}</span>
      </header>
      <div v-else-if="item.type === 'item'" class="timeline-item" :class="item.color">
        <div class="timeline-marker is-icon has-text-white" :class="item.color">
          <font-awesome-icon :icon="item.icon" />
        </div>
        <div class="timeline-content">
          <p class="heading">
            <strong>{{ item.company }}</strong> - {{ item.role }}
            <br>
            <i v-if="Date.now() < (new Date(item.startDate)).getTime()"><strong>FUTURE</strong> ({{ item.startDate }})</i>
            <i v-else>
              {{ item.startDate }} -
              <span v-if="item.endDate">{{ item.endDate }}</span>
              <span v-else><strong>Now</strong></span>
            </i>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { layout } from '@/static/data/timeline.json';

export default {
  data() {
    return {
      year: (new Date()).getFullYear(),
      layout,
    };
  },
};
</script>

<style lang="scss" scoped>
// Bitcoin
.timeline .timeline-item.icon-bitcoin::before {
  background-color: #ff9900;
}

.timeline .timeline-item .timeline-marker.icon-bitcoin.is-icon {
  border-color: #ff9900;
  background-color: #ff9900;
  color: #ffffff;
}

.tag:not(body).icon-bitcoin {
  background-color: #ff9900;
  color: #ffffff;
}
</style>
