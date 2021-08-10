<template>
  <div id="app">
    <!--     <a href="#" @click="changeTheme">Change theme</a>-->
    <!--    <router-view :key="$route.fullPath" />-->
    <router-view />
    <ConfirmationModal ref="confirmationModal"></ConfirmationModal>
    <DiUploadComponent></DiUploadComponent>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue, Watch } from 'vue-property-decorator';
import { DataInsiderTheme } from '@/themes/theme';
import KebabCase from 'lodash/kebabCase';
import { ThemeModule } from '@/store/modules/theme.store';
import { PopupUtils } from '@/utils/popup.utils';
import ConfirmationModal from '@/screens/Confirmation/view/ConfirmationModal.vue';
import { Modals } from '@/utils/modals';
import { TableTooltipUtils } from '@chart/CustomTable/TableTooltipUtils';
import { ColorUtils } from '@/utils/ColorUtils';

@Component({
  components: { ConfirmationModal }
})
export default class App extends Vue {
  @Ref()
  confirmationModal!: ConfirmationModal;

  get currentTheme(): DataInsiderTheme {
    return ThemeModule.currentTheme;
  }

  @Watch('currentTheme', { immediate: true })
  processThemeChange(currentTheme: DataInsiderTheme) {
    Object.entries(currentTheme).forEach((value, index) => {
      const [rawName, color] = value;
      const themeName = `--${KebabCase(rawName)}`;
      document.documentElement.style.setProperty(themeName, color);
    });
  }

  @Watch('dashboardCustomStyle', { immediate: true })
  processDashboardCustomStyleChange(newStyle: any): void {
    Object.entries(newStyle).forEach((data: any) => {
      const [key, value] = data;
      document.documentElement.style.setProperty(key, value);
    });
    const maxBackgroundColor = newStyle['--max-background-color'];
    const popoverColor = ColorUtils.mix(maxBackgroundColor, '#00000019');
    document.documentElement.style.setProperty('--popover-background-color', popoverColor);
  }

  private get dashboardCustomStyle(): any {
    return ThemeModule.dashboardStyle;
  }

  mounted() {
    this.$nextTick(() => {
      PopupUtils.init(this);
      Modals.init(this.confirmationModal);
      TableTooltipUtils.initTooltip();
    });
  }

  changeTheme(): void {
    // TODO: Method for testing, will change in the future
    ThemeModule.changeTheme();
  }
}
</script>

<style lang="scss">
@import '~@/themes/scss/custom-vue-context.scss';
@import '~@/themes/scss/black-dashboard/custom/context/vue-context.scss';
</style>
