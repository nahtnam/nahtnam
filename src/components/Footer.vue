<template>
  <div>
    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          &copy; {{ this.year }} nahtnam.
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {
      year: (new Date()).getFullYear(),
    };
  },
};
</script>

<style lang="scss" scoped>
.footer {
  padding: 3rem 1.5rem;
}
</style>
