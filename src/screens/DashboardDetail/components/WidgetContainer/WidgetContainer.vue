<template>
  <ChartContainer v-if="isChart(widget.className)" :meta-data="widget" :showEditComponent="isShowEdit" ref="chartContainer" />
  <!--    <FilterContainer v-else-if="isFilter(widget.className)" :filter="widget" :showEditComponent="isShowEdit" />-->
  <OtherWidget v-else :widget="widget" :showEditComponent="isShowEdit" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Widget, Widgets } from '@core/domain/Model';
import ChartContainer from './charts/ChartContainer.vue';
import OtherWidget from '@/screens/DashboardDetail/components/WidgetContainer/other/OtherWidget.vue';
import FilterContainer from '@filter/FilterContainer.vue';

@Component({
  components: {
    ChartContainer,
    FilterContainer,
    OtherWidget
  }
})
export default class WidgetContainer extends Vue {
  @Prop({ required: true })
  widget!: Widget;

  @Prop({ default: false, type: Boolean })
  isShowEdit!: boolean;

  isChart(className: string): boolean {
    return className == Widgets.Chart;
  }

  // isFilter(className: string): boolean {
  //   return className.endsWith('_filter');
  // }
}
</script>
