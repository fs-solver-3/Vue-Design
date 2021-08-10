<template>
  <MonacoEditor
    ref="monacoEditor"
    :language="formulaName"
    :options="editorOptions"
    :theme="formulaTheme"
    :value="formulaData"
    class="code"
    @change="onCodeChange"
  ></MonacoEditor>
</template>

<script lang="ts">
import { Component, Emit, Prop, PropSync, Ref, Vue } from 'vue-property-decorator';
import MonacoEditor, { monaco } from 'monaco-editor-vue';
import { FormulaTheme, QueryTheme } from '@/shared/constants/custom-editor.theme';
import { FormulaController } from '@/shared/fomula/FormulaController';
import { DebounceAction } from '@/shared/anotation/DebounceAction';
import { FormulaUtils } from '@/shared/fomula/FormulaUtils';
import { Log } from '@core/utils';

monaco.editor.defineTheme('formula-theme', FormulaTheme);
monaco.editor.defineTheme('query-theme', QueryTheme);

@Component({
  components: { MonacoEditor }
})
export default class FormulaCompletionInput extends Vue {
  @PropSync('formula', { required: true, type: String, default: '' })
  private formulaData!: string;

  @Prop({ required: true, type: Object })
  private readonly formulaController!: FormulaController;

  @Ref()
  private monacoEditor?: any;

  private cursorChangeListener?: any;

  private readonly editorOptions: any = {
    minimap: {
      enabled: false
    },
    lineNumbers: 'off',
    scrollbar: {
      horizontal: 'hidden',
      vertical: 'hidden'
    },
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    overviewRulerLanes: 0,
    automaticLayout: true,
    glyphMargin: false,
    // Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
    lineDecorationsWidth: 4,
    lineNumbersMinChars: 4,
    padding: {
      top: 16
    }
  };

  private get formulaTheme(): string {
    return this.formulaController.formulaTheme();
  }

  private get formulaName(): string {
    return this.formulaController.formulaName();
  }

  mounted() {
    this.formulaController.init(monaco);
    this.catchKeyAction();
    if (this.monacoEditor.editor) {
      this.cursorChangeListener = this.monacoEditor.editor.onDidChangeCursorPosition(this.handleOnCursorChanged);
    }
  }

  beforeDestroy() {
    this.formulaController.dispose();
    this.cursorChangeListener?.dispose();
  }

  catchKeyAction() {
    this.monacoEditor.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, (e: Event) => {
      this.$emit('onExecute');
    });
  }

  @DebounceAction({ timeDebounce: 100 })
  private handleOnCursorChanged(payload: { position: any }) {
    const keyword: string | undefined = FormulaUtils.findNearestKeyword(this.formulaData, payload.position, '\\b\\w+(?=\\()');
    if (keyword) {
      this.emitChangeKeyword(keyword);
    }
  }

  private onCodeChange(newCode: string): void {
    this.formulaData = newCode;
  }

  @Emit('onSelectKeyword')
  private emitChangeKeyword(keyword: string): string {
    return keyword;
  }
}
</script>

<style lang="scss">
::v-deep {
  .monaco-editor {
    padding-top: 15px;
  }

  .monaco-editor .lines-content.monaco-editor-background {
    margin-top: 14px;
  }
}
</style>
