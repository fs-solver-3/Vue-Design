/*
 * @author: tvc12 - Thien Vi
 * @created: 1/28/21, 3:00 PM
 */

import DiTab from '@/shared/components/DiTab.vue';
import { ThemeModule } from '@/store/modules/theme.store';
import { Component, Emit, Prop, PropSync, Ref, Vue } from 'vue-property-decorator';
import { TabItem } from '@/shared/models';
import GroupSettingComponent from '@/shared/components/builder/setting/GroupSettingComponent.vue';
import { ChartUtils } from '@/utils';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { WidgetType } from '@/shared';
import { DefaultHtml } from '@/shared/constants/custom-chart.html';
import { DefaultCss } from '@/shared/constants/custom-chart.css';
import { DefaultJs } from '@/shared/constants/custom-chart.js';
import { CustomLanguage } from '@/screens/ChartBuilder/components/VizPanel/CustomCodePanel.vue';

const CustomCodePanel = () => import('../CustomCodePanel.vue');
const CustomCodeModal = () => import('../CustomCodeModal.vue');

@Component({
  components: { DiTab, GroupSettingComponent, CustomCodePanel, CustomCodeModal }
})
export default class SettingPanel extends Vue {
  @PropSync('html', { type: String, required: true, default: DefaultHtml })
  private htmlSynced!: string;

  @PropSync('css', { type: String, required: true, default: DefaultCss })
  private cssSynced!: string;

  @PropSync('js', { type: String, required: true, default: DefaultJs })
  private jsSynced!: string;

  @Prop({ required: true, type: Boolean })
  private isDisable!: boolean;

  @PropSync('tabItems', { required: true, type: Array })
  private tabItemsSynced!: TabItem[];

  private optionSelected = CustomLanguage.Html;

  @Ref()
  private readonly customCodeModal!: any;

  private get settingStyle(): CSSStyleDeclaration {
    return {
      opacity: this.opacity,
      cursor: this.cursor,
      pointerEvents: this.pointerEvents
    } as CSSStyleDeclaration;
  }

  private get opacity(): string {
    const opacity: number = this.isDisable ? ThemeModule.currentTheme.disableOpacity : ThemeModule.currentTheme.enableOpacity;
    return opacity.toString();
  }

  private get cursor(): string {
    return this.isDisable ? 'not-allowed' : 'unset';
  }

  private get pointerEvents(): string {
    return this.isDisable ? 'none' : 'unset';
  }

  private get isCustomDisplay(): boolean {
    return this.tabItemsSynced[0].getItem('is_custom_display')?.value ?? false;
  }

  private get disableKeys(): string[] {
    if (this.isCustomDisplay) {
      return [];
    } else {
      return ['custom_render'];
    }
  }

  private get chartType(): WidgetType {
    return QueryBuilderStoreModule.chartType;
  }

  private isTabCode(tab: TabItem): boolean {
    return tab.key === 'custom_render';
  }

  private isNoneComponent(type: string) {
    return ChartUtils.isNoneComponent(type);
  }

  private isGroupSettingComponent(type: string) {
    return ChartUtils.isGroupSettingComponent(type);
  }

  private showCustomCode() {
    this.customCodeModal.show();
  }

  @Emit('applyCustomDisplay')
  private handleRun(event: MouseEvent) {
    return event;
  }

  private get title(): string {
    return this.tabItemsSynced[0].getItem('title')?.value ?? '';
  }
}
