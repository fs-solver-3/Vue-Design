<template>
  <div class="datasource-item btn-chart cursor-pointer d-flex flex-column" @click="handClickItem">
    <img width="118" height="80" :src="require(`@/assets/icon/data_ingestion/datasource/${item.src}`)" alt="" />
    <div class="title">
      <div class="  h-100 d-flex align-items-center justify-content-center">{{ item.title }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { ItemData, VisualizationItemData } from '@/shared';
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';

@Component
export default class DataSourceItem extends Vue {
  @Prop({ required: true })
  item!: ItemData;

  @Emit('onClickItem')
  private handClickItem(): ItemData {
    return this.item;
  }
}
</script>

<style lang="scss" scoped>
.datasource-item {
  width: 118px;
  height: 126px;
  margin: 12px;

  .title {
    height: 46px;
    width: 100%;
    background: var(--charcoal-2);
    border-radius: 4px;
  }
}
</style>
