<template>
  <div class="code">
    <MonacoEditor :language="settingItemSynced.key" :options="{}" :value="value" class="code" theme="vs-dark" @change="onCmCodeChange"> </MonacoEditor>
  </div>
</template>

<script lang="ts">
import { Component, PropSync, Ref, Vue } from 'vue-property-decorator';
import { SettingItem } from '@/shared/models';
import MonacoEditor from 'monaco-editor-vue';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { ChartUtils } from '@/utils';

@Component({
  components: {
    MonacoEditor
  }
})
export default class CodeInputComponent extends Vue {
  @PropSync('settingItem', { required: true })
  settingItemSynced!: SettingItem;

  @Ref()
  private input!: any;

  private currentValue: string | null = null;

  private timer: any;

  private get value(): string {
    if (!this.settingItemSynced.value || this.settingItemSynced.value.length === 0) {
      if (this.settingItemSynced.key === 'javascript') {
        this.settingItemSynced.value = ChartUtils.getDefaultJs(QueryBuilderStoreModule.chartType);
      }
      if (this.settingItemSynced.key === 'html') {
        this.settingItemSynced.value = ChartUtils.getDefaultHtml(QueryBuilderStoreModule.chartType);
      }
      if (this.settingItemSynced.key === 'css') {
        this.settingItemSynced.value = ChartUtils.getDefaultCss(QueryBuilderStoreModule.chartType);
      }
    }
    // Log.debug(this.settingItemSynced);
    return this.currentValue ?? this.settingItemSynced.value;
  }

  private set value(newValue: string) {
    this.currentValue = newValue;
  }

  private doSave() {
    this.settingItemSynced.value = this.value;
  }

  private onCmCodeChange(newCode: string) {
    this.currentValue = newCode;
    if (this.timer) clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.settingItemSynced.value = this.currentValue;
    }, 2000);
  }
}
</script>

<style scoped>
.code {
  text-align: left;
  min-height: 100% !important;
  min-width: 100% !important;
  height: 100% !important;
  width: 100% !important;
}
</style>
