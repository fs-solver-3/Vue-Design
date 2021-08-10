import { DarkTheme, DataInsiderTheme, LightTheme } from '@/themes/theme';
import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { Stores } from '@/shared/enums/stores.enum';
import { DashboardThemeType } from '@core/domain/Model/Dashboard/Setting/DashboardThemeType';
import { ColorUtils } from '@/utils/ColorUtils';

@Module({ store: store, name: Stores.themeStore, dynamic: true, namespaced: true })
class ThemeStore extends VuexModule {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  private static readonly themeAsMap = require('@/screens/DashboardDetail/Theme/DashboardTheme.json');
  currentTheme: DataInsiderTheme = DarkTheme;
  themeName: 'dark' | 'light' | 'custom' = 'dark';
  dashboardStyle: any = ThemeStore.themeAsMap[DashboardThemeType.default].style;
  paletteColor: string[] = ThemeStore.themeAsMap[DashboardThemeType.default].colors;

  get baseDashboardTheme(): string {
    return ColorUtils.combine(this.dashboardStyle['--min-background-color'], [this.dashboardStyle['--max-background-color']]);
  }

  @Mutation
  setDashboardTheme(themeName: DashboardThemeType) {
    this.dashboardStyle = ThemeStore.themeAsMap[themeName].style ?? ThemeStore.themeAsMap[DashboardThemeType.default].style;
    this.paletteColor = ThemeStore.themeAsMap[themeName].colors ?? ThemeStore.themeAsMap[DashboardThemeType.default].colors;
  }

  @Mutation
  changeTheme() {
    // TODO: Method for testing, will change in the future
    if (this.themeName == 'dark') {
      this.themeName = 'light';
      this.currentTheme = LightTheme;
    } else {
      this.themeName = 'dark';
      this.currentTheme = DarkTheme;
    }
  }
}

export const ThemeModule = getModule(ThemeStore);
