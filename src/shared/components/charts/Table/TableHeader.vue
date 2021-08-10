<template>
  <div class="table-chart-header-content">
    <div v-show="enableTitle" class="title-chart w-100 pr-2" :style="titleStyle" :title="title">{{ title }}</div>
    <div v-show="enableSubtitle" class="description-chart mt-1 w-100 pr-2" :style="subtitleStyle" :title="subTitle">{{ subTitle }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Align } from '@/shared/enums';

@Component
export default class TableHeader extends Vue {
  @Prop({ required: false, type: Boolean, default: true })
  private enableTitle!: boolean;
  @Prop({ required: false, type: Boolean, default: true })
  private enableSubtitle!: boolean;

  @Prop({ required: true, type: String })
  private readonly title!: string;

  @Prop({ required: true, type: String })
  private readonly titleAlign!: Align;

  @Prop({ required: true })
  private readonly titleStyle: any;

  @Prop({ required: true, type: String })
  private readonly subTitle!: string;

  @Prop({ required: true, type: String })
  private readonly subtitleAlign!: Align;

  @Prop({ required: true })
  private readonly subtitleStyle: any;
}
</script>
