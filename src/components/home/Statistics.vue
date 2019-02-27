<template>
  <div>
    <nav class="level">
      <div class="level-item has-text-centered">
        <div>
          <p class="title">
            TODO
          </p>
          <p class="heading">
            Contributions
          </p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="title">
            TODO
          </p>
          <p class="heading">
            Posts
          </p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="title">
            TODO
          </p>
          <p class="heading">
            Followers
          </p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="title">
            {{ age }}
          </p>
          <p class="heading">
            Age
          </p>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  data() {
    return {
      age: 0,
    };
  },

  created() {
    this.getAge();
    this.ageInterval = setInterval(this.getAge, 1000);
  },

  beforeDestroy() {
    if (!this.ageInterval) {
      return;
    }
    clearInterval(this.ageInterval);
  },

  methods: {
    getAge(birthday = 'October 10, 1999') {
      const diff = Date.now() - (new Date(birthday).getTime());
      const age = diff / (1000 * 60 * 60 * 24 * 365);
      this.age = age.toFixed(7);
    },
  },
};
</script>
