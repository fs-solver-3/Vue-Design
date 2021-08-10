<template>
  <div class="d-flex justify-content-center align-items-center rounded h-100">
    <div>
      <img class="ic-60" style="margin-bottom: 15px" src="@/assets/icon/ic_empty_data.svg" alt="empty data" />
    </div>
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class EmptyWidget extends Vue {}
</script>
<style lang="scss" scoped>
@import '~@/themes/scss/di-variables.scss';
@import '~@/themes/scss/mixin.scss';

.text-info {
  @include regular-text;
  font-size: 12px;
  letter-spacing: 0.2px;
  text-align: center;
  color: $white !important;
  opacity: 0.8;
}
.text-body {
  @include regular-text;
  font-size: 12px;
  letter-spacing: 0.2px;
  text-align: center;
  opacity: 0.6;
  color: $white !important;
  margin-top: 8px;
}
</style>
