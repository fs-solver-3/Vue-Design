<template>
  <div class="title unselectable">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component({})
export default class DiTitle extends Vue {
  //
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 24px;
  letter-spacing: 0.2px;
  line-height: 1.17;
}
</style>
