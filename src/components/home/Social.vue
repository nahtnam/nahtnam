<template>
  <div>
    <div class="columns is-mobile is-multiline">
      <div class="column is-one-quarter-mobile" v-for="network in media" :key="network.url">
        <a :href="network.url" class="icon has-text-info fa-3x is-large" target="_blank" rel="noopener noreferrer">
          <font-awesome-icon :icon="network.icon" :class="network.color" />
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { media } from '@/static/social.json';

export default {
  data() {
    return {
      media,
    };
  },
};
</script>


<style lang="scss" scoped>
.icon-github {
  color: #212121;
}

.icon-twitter {
  color: #1da1f2;
}

.icon-instagram {
  color: #405de6;
}

.icon-facebook {
  color: #3b5998;
}

.icon-linkedin {
  color: #0077b5;
}

.icon-stack-overflow {
  color: #f48024;
}

.icon-steam {
  color: #000000;
}

.icon-bitcoin {
  color: #ff9900;
}
</style>
