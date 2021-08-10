<template>
  <div class="h-100">
    <div class="d-flex custom-code-header">
      <DiDropdown
        v-model="languageSelected"
        :id="genDropdownId(`${prefixId}-custom-code`)"
        :data="options"
        class="selection"
        label-props="displayName"
        value-props="id"
      />
      <div class="ml-auto d-inline-flex button-bar">
        <DiButton :id="genBtnId(`${prefixId}-run-custom-code`)" title="Run" @click="handleClickRun">
          <img alt="run" src="@/assets/icon/run.svg" />
        </DiButton>
        <DiButton :id="genBtnId(`${prefixId}-run-custom-code`)" title="Save" @click="handleClickSave" v-if="isEnableButtonSave">
          <img alt="save" src="@/assets/icon/download.svg" />
        </DiButton>
      </div>
    </div>
    <div class="custom-code-body">
      <MonacoEditor
        :language="languageSelected"
        :options="monacoEditorOptions"
        :value="customCode"
        class="code"
        theme="di-theme-dark"
        @change="onCustomCodeChange"
      >
      </MonacoEditor>
    </div>
    <slot name="zoom-icon"></slot>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, PropSync, Vue } from 'vue-property-decorator';
import { SelectOption } from '@/shared';
import DiButton from '@/shared/components/DiButton.vue';
import MonacoEditor, { monaco } from 'monaco-editor-vue';
import { DefaultHtml } from '@/shared/constants/custom-chart.html';
import { DefaultCss } from '@/shared/constants/custom-chart.css';
import { DefaultJs } from '@/shared/constants/custom-chart.js';
import { DiEditorThemeDark } from '@/shared/constants/custom-editor.theme';
import { DownloadableFileWriter } from '@core/misc/csv/file_writer';
import { snakeCase } from 'lodash';

export enum CustomLanguage {
  Html = 'html',
  Css = 'css',
  Js = 'javascript'
}

monaco.editor.defineTheme('di-theme-dark', DiEditorThemeDark);

@Component({
  components: { DiButton, MonacoEditor }
})
export default class CustomCodePanel extends Vue {
  static DEFAULT_OPTIONS: SelectOption[] = [
    { displayName: 'HTML', id: CustomLanguage.Html },
    { displayName: 'Javascript', id: CustomLanguage.Js },
    { displayName: 'CSS', id: CustomLanguage.Css }
  ];
  private readonly options = CustomCodePanel.DEFAULT_OPTIONS;

  @PropSync('optionSelected', { required: true, type: String })
  private languageSelected!: CustomLanguage;

  @PropSync('html', { type: String, required: true, default: DefaultHtml })
  private customHtml!: string;

  @PropSync('css', { type: String, required: true, default: DefaultCss })
  private customCss!: string;

  @PropSync('js', { type: String, required: true, default: DefaultJs })
  private customJs!: string;

  @Prop({ required: true, type: String })
  private title!: string;

  @Prop({ required: false, type: String, default: '' })
  private prefixId!: string;

  @Prop({ required: false, type: Boolean, default: false })
  private isEnableButtonSave!: boolean;

  private get customCode(): string {
    switch (this.languageSelected) {
      case CustomLanguage.Html:
        return this.customHtml;
      case CustomLanguage.Js:
        return this.customJs;
      case CustomLanguage.Css:
        return this.customCss;
      default:
        return '';
    }
  }

  private set customCode(code: string) {
    switch (this.languageSelected) {
      case CustomLanguage.Html:
        this.customHtml = code;
        break;
      case CustomLanguage.Js:
        this.customJs = code;
        break;
      case CustomLanguage.Css:
        this.customCss = code;
        break;
    }
  }

  // See options in [here](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html)
  private get monacoEditorOptions() {
    return {
      minimap: {
        enabled: false
      },
      lineNumbers: 'off',
      scrollbar: {
        horizontal: 'hidden',
        vertical: 'hidden'
      },
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: true,
      overviewRulerLanes: 0,
      automaticLayout: true
    };
  }

  @Emit('onRun')
  private handleClickRun(event: MouseEvent) {
    return event;
  }

  private handleClickSave(event: MouseEvent) {
    const fileName: string = this.getFileName(this.title, this.languageSelected);
    const writer = new DownloadableFileWriter(fileName, true);
    writer.write(this.customCode);
    writer.close();
  }

  private getFileName(title: string, customLanguage: CustomLanguage): string {
    const name: string = snakeCase(title);
    switch (customLanguage) {
      case CustomLanguage.Css:
        return `${name}.css`;
      case CustomLanguage.Js:
        return `${name}.js`;
      case CustomLanguage.Html:
        return `${name}.html`;
      default:
        return `${name}`;
    }
  }

  private onCustomCodeChange(newCode: string) {
    this.customCode = newCode;
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';

.custom-code-header {
  background-color: var(--charcoal);
  border-radius: 4px 4px 0 0;
  height: 42px;

  padding: 0 16px;

  .selection {
    margin: 0;

    ::v-deep {
      button {
        background-color: transparent;
        padding-left: 0;

        > div {
          font-weight: bold;
          padding-right: 15px;

          span {
            @include bold-text-14();
            letter-spacing: 0.6px;
          }
        }
      }
    }
  }

  .button-bar {
    > div + div {
      margin-left: 24px;
    }

    > div {
      margin: 4px 0;
      padding: 0 4px;
    }

    .btn-ghost {
      &:active {
        background-color: var(--primary);
      }

      &:hover {
        background-color: var(--primary) !important;
      }
    }
  }
}

.custom-code-body {
  height: 100%;
  text-align: left;
  width: 100%;
}
</style>
