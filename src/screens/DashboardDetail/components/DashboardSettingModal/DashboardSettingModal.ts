/*
 * @author: tvc12 - Thien Vi
 * @created: 5/25/21, 6:15 PM
 */
import { Component, Ref, Vue } from 'vue-property-decorator';
import DiCustomModal from '@/shared/components/DiCustomModal.vue';
import { cloneDeep } from 'lodash';
import { DashboardSettingModalData } from '@/screens/DashboardDetail/components/DashboardSettingModal/DashboardSettingModalData';
import { SettingItem } from '@/shared/models';
import { DashboardSetting } from '@core/domain';
import ToggleSettingComponent from '@/shared/components/builder/setting/ToggleSettingComponent.vue';
import { DashboardThemeType } from '@core/domain/Model/Dashboard/Setting/DashboardThemeType';
import { LabelNode } from '@/shared';
import { ThemeModule } from '@/store/modules/theme.store';

@Component({
  components: {
    DiCustomModal,
    ToggleSettingComponent
  }
})
export default class DashboardSettingModal extends Vue {
  private settingModalData: DashboardSettingModalData | null = null;

  @Ref('modal')
  private readonly modal?: DiCustomModal;
  private overlapSettingItem: SettingItem = SettingItem.default();
  private themes: LabelNode[] = [
    {
      label: 'Default',
      type: DashboardThemeType.default
    },
    {
      label: 'Clear Sky',
      type: DashboardThemeType.theme1
    },
    {
      label: 'Deep Sea Space',
      type: DashboardThemeType.theme2
    },
    {
      label: 'Lawrencium',
      type: DashboardThemeType.theme3
    },
    {
      label: 'Sin City Red',
      type: DashboardThemeType.theme4
    }
  ];
  private currentTheme = DashboardThemeType.default;
  private DashboardThemeType = DashboardThemeType;

  private get canShowModal(): boolean {
    return !!this.settingModalData;
  }

  show(settingModalData: DashboardSettingModalData): void {
    this.progressSettingData(settingModalData);
    this.showSettingModal();
  }

  hide(): void {
    this.modal?.hide();
  }

  getCurrentDashboardSetting(): DashboardSetting {
    return new DashboardSetting({
      enableOverlap: this.overlapSettingItem.value,
      themeName: this.currentTheme
    });
  }

  private onOverlapSettingChanged(key: string, value: boolean) {
    this.overlapSettingItem.value = value;
  }

  private applySetting(): void {
    if (this.settingModalData && this.settingModalData.onApply) {
      const setting = this.getCurrentDashboardSetting();
      this.settingModalData.onApply(setting);
    }
  }

  private cancelSetting(): void {
    ThemeModule.setDashboardTheme(this.settingModalData?.setting?.themeName ?? DashboardThemeType.default);
    if (this.settingModalData && this.settingModalData.onCancel) {
      this.settingModalData.onCancel();
    }
  }

  private progressSettingData(settingModalData: DashboardSettingModalData) {
    this.settingModalData = cloneDeep(settingModalData);
    this.overlapSettingItem = SettingItem.toggle('overlap', 'Overlap mode', settingModalData.setting.enableOverlap, '');
    this.currentTheme = settingModalData.setting.themeName;
  }

  private showSettingModal() {
    this.$nextTick(() => this.modal?.show());
  }

  private selectTheme(themeType: DashboardThemeType): void {
    this.currentTheme = themeType;
    ThemeModule.setDashboardTheme(themeType);
  }
}
