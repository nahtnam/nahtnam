<template>
  <div class="timeline is-rtl">
    <header class="timeline-header">
      <span class="tag is-medium is-primary">{{ this.year + 1 }}</span>
    </header>
    <div class="timeline-item is-success">
      <div class="timeline-marker is-success is-icon has-text-white">
        <font-awesome-icon icon="bicycle" />
      </div>
      <div class="timeline-content">
        <p class="heading">
          <strong>Lime</strong> - Software Engineering Intern
          <br>
          <i>FUTURE (2019)</i>
        </p>
      </div>
    </div>
    <header class="timeline-header">
      <span class="tag is-primary">2019</span>
    </header>
    <div class="timeline-item is-danger">
      <div class="timeline-marker is-danger is-icon has-text-white">
        <font-awesome-icon icon="shopping-bag" />
      </div>
      <div class="timeline-content">
        <p class="heading">
          <strong>Ebates/Rakuten</strong> - Software Engineering Intern
          <br>
          <i>June 2015 - September 2018</i>
        </p>
      </div>
    </div>
    <header class="timeline-header">
      <span class="tag is-primary">2018</span>
    </header>
    <div class="timeline-item is-warning">
      <div class="timeline-marker is-warning is-icon">
        <font-awesome-icon icon="shipping-fast" />
      </div>
      <div class="timeline-content">
        <p class="heading">
          <strong>Roambee</strong> - Software Engineering Intern
          <br>
          <i>July 2016 - August 2015</i>
        </p>
      </div>
    </div>
    <header class="timeline-header">
      <span class="tag is-primary">2016</span>
    </header>
    <div class="timeline-item color-bitcoin">
      <div class="timeline-marker color-bitcoin is-icon">
        <font-awesome-icon :icon="['fab', 'bitcoin']" />
      </div>
      <div class="timeline-content">
        <p class="heading">
          <strong>Card for Coin</strong> - Software Engineering Intern
          <br>
          <i>June 2015 - August 2015</i>
        </p>
      </div>
    </div>
    <header class="timeline-header">
      <span class="tag is-medium is-primary">2015</span>
    </header>
  </div>
</template>

<script>
export default {
  data() {
    return {
      year: (new Date()).getFullYear(),
    };
  },
};
</script>

<style lang="scss" scoped>
// Bitcoin
.timeline .timeline-item.color-bitcoin::before {
  background-color: #ff9900;

}
.timeline .timeline-item .timeline-marker.color-bitcoin.is-icon {
  border-color: #ff9900;
  background-color: #ff9900;
  color: white;
}
</style>
