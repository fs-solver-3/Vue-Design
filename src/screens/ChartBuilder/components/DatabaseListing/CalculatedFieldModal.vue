<template>
  <Modal id="calculated-field" :centered="false" :show-close="true" :show.sync="isModalShowing" class="modal-config" modalClasses="custom-modal">
    <span slot="header">
      <template v-if="isCreateMode">
        Create
      </template>
      <template v-else-if="isEditMode">
        Edit
      </template>
      <span class="header-title">Calculated Column</span>
    </span>
    <div class="d-flex flex-row">
      <div class="col-6 p-0">
        <div class="d-flex flex-row align-items-start">
          <div class="col p-0">
            <template>
              <input
                :id="genInputId('field-name')"
                ref="displayNameInput"
                v-model="displayName"
                autocomplete="off"
                class="form-control"
                placeholder="Column name"
                type="text"
                @keydown.enter="formulaInput.focus"
              />
            </template>
          </div>
        </div>
        <div class="mt-3">
          <div class="formula-input">
            <FormulaCompletionInput :formula.sync="formula" :formulaController="formulaController" @onSelectKeyword="handleSelectKeyword" />
          </div>
          <template>
            <div class="footer">
              <div v-if="$v.$error || hasError" class="error pl-1 float-left">
                <span v-if="!$v.displayName.required">Column name is required.</span>
                <span v-else-if="!$v.formula.required">Formula field is required.</span>
                <span v-else-if="hasError"> {{ messageError }}</span>
              </div>
              <div class="modal-footer button-bar">
                <template v-if="isEditMode">
                  <button class="btn-ghost" @click="hide">Cancel</button>
                  <button class="btn-primary" @click="editCalculatedField">Update</button>
                </template>
                <template v-else-if="isCreateMode">
                  <button class="btn-ghost" @click="hide">Cancel</button>
                  <button class="btn-primary" @click="createCalculatedField">Create</button>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="col-3 pr-0">
        <template>
          <div>
            <DiDropdown v-model="supportedFunctionSelected" :data="supportedFunctions" label-props="displayName" value-props="data"></DiDropdown>
          </div>
          <div class="syntax-options mt-3">
            <vuescroll>
              <div>
                <DataListing :records="listingFunctions" key-for-display="name" @onClick="showDescription" />
              </div>
            </vuescroll>
          </div>
        </template>
      </div>
      <div class="col-3 syntax-detail">
        <template v-if="currentFunction">
          <div class="title">
            <h3 class="mt-2">
              {{ currentFunction.title || currentFunction.name }}
            </h3>
          </div>
          <div class="mt-2 syntax-description">
            <vuescroll>
              <h5>
                {{ currentFunction.description }}
              </h5>
              <template v-if="currentFunction.example">
                <h4>Example:</h4>
                <code class="example">{{ currentFunction.example }}</code>
              </template>
            </vuescroll>
          </div>
        </template>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'vue-property-decorator';
import { Column, TableSchema } from '@core/domain/Model';
import { required } from 'vuelidate/lib/validators';
import { DIException, FormulaException } from '@core/domain/Exception';
import { DatabaseSchemaModule } from '@/store/modules/data_builder/database_schema.store';
import { ExpressionParser, RawExpressionData } from '@core/schema/service/ExpressionParser';
import { SelectOption } from '@/shared';
import DataListing from '@/screens/DashboardDetail/components/WidgetContainer/charts/ActionWidget/DataListing.vue';
import { FormulaSuggestionModule, FunctionInfo } from '@/screens/ChartBuilder/stores/FormulaSuggestionStore';
import FormulaCompletionInput from '@/shared/components/FormulaCompletionInput/FormulaCompletionInput.vue';
import { Log } from '@core/utils';
import { FormulaController } from '@/shared/fomula/FormulaController';
import { ClickhouseFormulaController } from '@/shared/fomula/ClickhouseFormulaController';
import { CalculatedFieldModalMode, CreateCalculatedFieldData, EditCalculatedFieldData } from '@/screens/ChartBuilder/model/CalculatedFieldData';
import { AtomicAction } from '@/shared/anotation/AtomicAction';

@Component({
  components: {
    FormulaCompletionInput,
    DataListing
  },
  validations: {
    displayName: { required },
    formula: { required }
  }
})
export default class CalculatedFieldModal extends Vue {
  private readonly ALL_SUPPORTED_FUNCTION = 'All';
  private isModalShowing = false;
  private tableSchema!: TableSchema;
  private displayName = '';
  private formula = '';
  private editingColumn?: Column;

  private messageError = '';
  private supportedFunctionSelected = this.ALL_SUPPORTED_FUNCTION;
  private currentFunction: FunctionInfo | null = null;
  private formulaController: FormulaController | null = null;

  private mode = CalculatedFieldModalMode.Create;

  @Ref()
  private readonly formulaInput?: HTMLInputElement;

  @Ref()
  private readonly displayNameInput?: HTMLInputElement;

  private get isEditMode(): boolean {
    return this.mode == CalculatedFieldModalMode.Edit;
  }

  private get isCreateMode(): boolean {
    return this.mode == CalculatedFieldModalMode.Create;
  }

  private get supportedFunctions(): SelectOption[] {
    const supportedFunctions = FormulaSuggestionModule.supportedFunctionNames.map((name, index) => {
      return { id: index, displayName: name, data: name };
    });
    const allFunctions = { id: -1, displayName: 'All', data: this.ALL_SUPPORTED_FUNCTION };
    return [allFunctions, ...supportedFunctions];
  }

  private get listingFunctions(): FunctionInfo[] {
    if (this.supportedFunctionSelected === this.ALL_SUPPORTED_FUNCTION) {
      return FormulaSuggestionModule.allFunctions;
    } else {
      return FormulaSuggestionModule.getFunctions(this.supportedFunctionSelected);
    }
  }

  private get hasError(): boolean {
    return !!this.messageError;
  }

  public showCreateModal(tableSchema: TableSchema): void {
    this.resetData();

    this.mode = CalculatedFieldModalMode.Create;
    this.tableSchema = tableSchema;
    this.isModalShowing = true;

    this.initFormulaSuggestion(tableSchema);
  }

  public showEditModal(tableSchema: TableSchema, column: Column): void {
    this.resetData();
    this.initDefaultData(tableSchema, column);

    this.mode = CalculatedFieldModalMode.Edit;
    this.tableSchema = tableSchema;
    this.isModalShowing = true;

    this.initFormulaSuggestion(tableSchema);
  }

  hide() {
    this.isModalShowing = false;
  }

  private initDefaultData(tableSchema: TableSchema, column: Column) {
    this.formula = this.getFormula(tableSchema, column);
    this.displayName = column.displayName;
    this.editingColumn = column;
  }

  private getFormula(tableSchema: TableSchema, column: Column): string {
    const expression: string | undefined = column.defaultExpression?.expr;
    if (expression) {
      try {
        return ExpressionParser.bindDisplayNameOfSchema(tableSchema, expression);
      } catch (ex) {
        return '';
      }
    } else {
      return '';
    }
  }

  private initFormulaSuggestion(tableSchema: TableSchema) {
    FormulaSuggestionModule.initSuggestFunction(['supported_function.json']);
    FormulaSuggestionModule.initSuggestField(tableSchema);
    this.formulaController = new ClickhouseFormulaController(FormulaSuggestionModule.allFunctions, FormulaSuggestionModule.columns);

    this.$nextTick(() => {
      this.displayNameInput?.focus();
      this.currentFunction = this.listingFunctions[0];
    });
  }

  private resetData(): void {
    this.displayName = '';
    this.editingColumn = void 0;
    this.formula = '';
    this.$v.$reset();
  }

  private validateCalculatedFieldData(): boolean {
    this.$v.$touch();
    return !this.$v.$error;
  }

  @AtomicAction({ timeUnlockAfterComplete: 500 })
  private async createCalculatedField(): Promise<void> {
    Log.debug('createCalculatedField::');
    if (this.validateCalculatedFieldData()) {
      try {
        const createFieldData: CreateCalculatedFieldData = {
          displayName: this.displayName,
          tableSchema: this.tableSchema,
          expression: ExpressionParser.parse(new RawExpressionData(this.formula, this.tableSchema))
        };

        await DatabaseSchemaModule.createCalculatedField(createFieldData);
        await DatabaseSchemaModule.reload(createFieldData.tableSchema.dbName);

        this.hide();
      } catch (ex) {
        this.handleException(ex);
      }
    }
  }

  @AtomicAction({ timeUnlockAfterComplete: 500 })
  private async editCalculatedField(): Promise<void> {
    if (this.validateCalculatedFieldData() && this.editingColumn) {
      try {
        const editFieldData: EditCalculatedFieldData = {
          displayName: this.displayName,
          tableSchema: this.tableSchema,
          editingColumn: this.editingColumn,
          newExpression: ExpressionParser.parse(new RawExpressionData(this.formula, this.tableSchema))
        };

        await DatabaseSchemaModule.editCalculatedField(editFieldData);
        await DatabaseSchemaModule.reload(editFieldData.tableSchema.dbName);
        this.hide();
      } catch (ex) {
        this.handleException(ex);
      }
    }
  }

  private handleException(ex: any): void {
    Log.debug('handleException::', ex);
    // be careful: instanceof not working!!
    if (FormulaException.isFormulaException(ex)) {
      this.showFormulaError(ex);
    } else {
      this.showNormalError(DIException.fromObject(ex));
    }
  }

  private showFormulaError(ex: FormulaException) {
    this.messageError = ex.message;
  }

  private showNormalError(ex: DIException) {
    this.messageError = ex.message ?? 'Something went wrong';
  }

  private showDescription(functionInfo: FunctionInfo): void {
    this.currentFunction = functionInfo;
  }

  private handleSelectKeyword(keyword: string): void {
    const isDiffFunction = this.currentFunction?.title !== keyword;
    if (isDiffFunction) {
      const functionInfo: FunctionInfo | undefined = FormulaSuggestionModule.getFunctionInfo(keyword);
      if (functionInfo) {
        this.showDescription(functionInfo);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';

@import '~bootstrap/scss/bootstrap-grid';

::v-deep {
  @import '~@/themes/scss/custom-popover';

  .custom-modal {
    max-width: 1500px !important;
    width: 1500px !important;

    @media (max-width: 1199.98px) {
      max-width: 800px !important;
      width: 800px !important;
    }

    @media (min-width: 1200px) and (max-width: 1600px) {
      max-width: 1000px !important;
      width: 1000px !important;
    }

    //@media (min-width: 1024.1px) and (max-width: 1199.98px) {
    //  max-width: 800px !important;
    //  width: 800px !important;
    //}

    .modal-body {
      padding-top: 0px !important;

      > div {
        margin: 0;
      }
    }

    .formula-input {
      height: 450px;

      @media (max-width: 1199.98px) {
        height: 290px;
      }

      @media (min-width: 1200px) and (max-width: 1600px) {
        height: 350px;
      }
    }

    .footer {
      margin-top: 16px;

      .error {
        margin-top: 10px;
      }

      .button-bar {
        float: right;
        padding: 0;
        width: 220px;
        @include regular-text-14();

        > button {
          margin: 0;
        }

        button + button {
          margin-left: 16px;
        }
      }
    }

    .syntax-options {
      background-color: var(--secondary);
      max-height: 510px;
      min-height: 510px;
      overflow: scroll;

      position: relative;

      @media (max-width: 1199.98px) {
        max-height: 350px;
        min-height: 350px;
      }

      @media (min-width: 1200px) and (max-width: 1600px) {
        height: 410px;
        min-height: 410px;
      }
    }

    .syntax-detail {
      .title {
        height: 40px;

        h3 {
          @include bold-text();
          font-size: 17px;
          text-align: left;
        }
      }

      .syntax-description {
        max-height: 510px;

        overflow: scroll;

        @media (max-width: 1199.98px) {
          max-height: 350px;
        }

        @media (min-width: 1200px) and (max-width: 1600px) {
          height: 410px;
        }
        @include regular-text-14();

        h4 {
          font-size: 18px;
        }

        h5 {
          text-align: left;
          @include regular-text-14();
        }
      }
    }

    .select-container {
      height: 40px;
      margin-top: 0;
    }
  }

  .custom-b-popover {
    justify-content: center;
    position: relative;
    width: 90%;

    .suggestion-panel {
      max-height: 180px;
      overflow: scroll;
    }
  }
}
</style>
