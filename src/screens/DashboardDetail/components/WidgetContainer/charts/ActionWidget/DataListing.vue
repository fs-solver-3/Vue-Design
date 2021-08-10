<template>
  <div>
    <template>
      <template v-for="(row, index) in records">
        <div :key="index">
          <slot :row="row">
            <div class="btn-row cursor-pointer btn-ghost" @click.stop="handleClickRecord(row)">
              <h4 class="text-nowrap my-1" :title="row[keyForDisplay]">{{ row[keyForDisplay] }}</h4>
            </div>
          </slot>
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';

@Component
export default class DataListing extends Vue {
  @Prop({ required: true, type: Array })
  private readonly records!: any[];

  @Prop({ required: false, type: String, default: 'label' })
  private readonly keyForDisplay!: string;

  @Prop({ required: false, type: String })
  private readonly keyForValue?: string;

  @Emit('onClick')
  private handleClickRecord(row: any) {
    if (this.keyForValue) {
      return row[this.keyForValue];
    } else {
      return row;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';

.btn-row {
  cursor: pointer !important;
  padding: 6px 12px;

  > h4 {
    @include semi-bold-14();
    cursor: unset;
  }
}
</style>
