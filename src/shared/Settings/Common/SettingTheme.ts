import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';

export interface SettingTheme {
  readonly name: string;
  readonly key: string;
  readonly settings: Record<SettingKey, any>;
}
