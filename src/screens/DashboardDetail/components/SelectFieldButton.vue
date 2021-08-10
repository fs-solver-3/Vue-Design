<template>
  <div class="position-relative">
    <DiButton :id="id" ref="btnRef" :title="title" class="col-auto pl-8" tabindex="-1" @click="toggleShowPopover">
      <img :alt="title" :src="require(`@/assets/icon/${iconImage}`)" class="icon-title" />
    </DiButton>
    <BPopover boundary="window" :show.sync="isShowPopover" :target="id" custom-class="db-listing-searchable" placement="top" triggers="blur">
      <StatusWidget :error="databaseError" :status="databaseStatus" @retry="handleLoadDatabases">
        <SlideXRightTransition group>
          <div key="1">
            <slot v-if="isShowExtraSlot" name="extraStep"></slot>
            <div v-else>
              <DataListingSearchable
                v-if="isSelectDatabase"
                key="db-listing"
                :options="databaseOptions"
                hintText="Search database..."
                @onClickOption="handleClickDatabase"
              >
              </DataListingSearchable>
              <DataListingSearchable
                v-else-if="isSelectTable"
                key="table-listing"
                :canBack="true"
                :displayBackTitle="databaseSelected.displayName"
                :options="tableOptions"
                hintText="Search table..."
                @onClickBack="handleClickBackToSelectDatabase"
                @onClickOption="handleClickTable"
              >
              </DataListingSearchable>
              <FieldListingSearchable
                v-else
                key="field-listing"
                :canBack="true"
                :displayBackTitle="tableSelected.displayName"
                :groupedFields="groupedFields"
                :isShowGroupedHeader="isShowGroupedHeader"
                :isShowResetFilterButton="isShowResetFilterButton"
                @onClickBack="handleClickBackToTSelectTable"
              >
              </FieldListingSearchable>
            </div>
          </div>
        </SlideXRightTransition>
      </StatusWidget>
    </BPopover>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Ref, Vue, Watch } from 'vue-property-decorator';
import DataListingSearchable from '@/shared/components/DataListingSearchable.vue';
import FieldListingSearchable from '@/shared/components/FieldListingSearchable.vue';
import { GroupedField, SelectOption, Status, Stores } from '@/shared';
import { DatabaseSchema, DIException, FieldDetailInfo, TableSchema } from '@core/domain';
import { SlideXRightTransition } from 'vue2-transitions';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import { mapGetters } from 'vuex';
import { ListUtils, SchemaUtils } from '@/utils';
import { SchemaService } from '@core/schema/service/SchemaService';
import { DI } from '@core/modules';
import { DataManager } from '@core/services';
import { GroupFieldBuilder } from '@core/schema/service/GroupFieldBuilder';
import { DateFieldFilter, NumberFieldFilter, TextFieldFilter } from '@core/schema/service/FieldFilter';
import { DashboardModule } from '@/screens/DashboardDetail/stores';

@Component({
  components: {
    StatusWidget,
    FieldListingSearchable,
    DataListingSearchable,
    SlideXRightTransition
  },
  computed: {
    ...mapGetters(Stores.dashboardStore, ['databaseUniqueNames'])
  }
})
export default class SelectFieldButton extends Vue {
  @Prop({ type: Boolean, default: false })
  isShowExtraSlot!: boolean;
  @Prop({ type: Boolean, default: true })
  isShowResetFilterButton!: boolean;
  @Prop({ type: Boolean, default: true })
  isShowGroupedHeader!: boolean;
  @Prop({ required: true, type: Number })
  dashboardId!: number;
  @Prop()
  fnProfileFieldFilter?: (profileField: FieldDetailInfo) => boolean;
  @Ref()
  btnRef!: any;
  private isShowPopover = false;
  private databaseStatus = Status.Loading;
  private databaseError = '';
  private databaseUniqueNames!: string[];
  private databaseInfos: DatabaseSchema[] = [];
  private databaseSelected: DatabaseSchema | null = null;
  private tableSelected: TableSchema | null = null;
  @Prop({ type: Boolean, default: false })
  private isShowPopoverImmediate!: boolean;
  @Prop({ required: true, type: String })
  private id!: string;
  @Prop({ required: true, type: String })
  private title!: string;
  @Prop({ required: true, type: String })
  private iconImage!: string;

  private get databaseOptions(): SelectOption[] {
    return this.databaseInfos.map((item, index) => {
      return { id: index, displayName: item.displayName, data: item };
    });
  }

  private get tableOptions(): SelectOption[] {
    if (this.databaseSelected) {
      return this.databaseSelected.tables.map((table, index) => {
        return { id: index, displayName: table.displayName, data: table };
      });
    } else {
      return [];
    }
  }

  private get groupedFields(): GroupedField[] {
    if (ListUtils.isNotEmpty(this.profileFields)) {
      return new GroupFieldBuilder(this.profileFields)
        .addFilter(new NumberFieldFilter())
        .addFilter(new DateFieldFilter())
        .addFilter(new TextFieldFilter())
        .build();
    } else {
      return [];
    }
  }

  private get profileFields(): FieldDetailInfo[] {
    if (this.tableSelected && ListUtils.isNotEmpty(this.tableSelected.columns)) {
      if (this.fnProfileFieldFilter) {
        return SchemaUtils.buildFieldsFromTableSchemas([this.tableSelected]).filter(this.fnProfileFieldFilter);
      }

      return SchemaUtils.buildFieldsFromTableSchemas([this.tableSelected]);
    } else {
      return [];
    }
  }

  private get isSelectDatabase(): boolean {
    return !this.databaseSelected;
  }

  private get isSelectTable(): boolean {
    return !this.tableSelected;
  }

  private get isNeedLoadDatabases(): boolean {
    return this.databaseStatus == Status.Error || ListUtils.isEmpty(this.databaseInfos);
  }

  private get schemaService(): SchemaService {
    return DI.get(SchemaService);
  }

  private get dataManager(): DataManager {
    return DI.get(DataManager);
  }

  @Watch('isShowPopoverImmediate', { immediate: true })
  onShowPopoverChanged(isShowPopoverImmediate: boolean) {
    if (isShowPopoverImmediate) {
      this.toggleShowPopover();
      this.$nextTick(() => {
        this.btnRef.$el.focus();
      });
    }
  }

  @Watch('isShowPopover')
  handleClearResetMainDate(val: boolean, oldVal: boolean) {
    if (!val) this.$emit('handle-clear-reset-main-date');
  }

  @Provide('handleHideListing')
  hide(): void {
    this.isShowPopover = false;
  }

  show(): void {
    this.isShowPopover = true;
  }

  private toggleShowPopover() {
    this.isShowPopover = !this.isShowPopover;
    if (this.isSelectDatabase && this.isNeedLoadDatabases) {
      this.handleLoadDatabases();
    }
  }

  private handleClickDatabase(selectOption: SelectOption) {
    this.databaseSelected = selectOption.data as DatabaseSchema;
  }

  private handleClickTable(selectOption: SelectOption) {
    this.tableSelected = selectOption.data as TableSchema;
  }

  private handleClickBackToSelectDatabase() {
    this.databaseSelected = null;
  }

  private handleClickBackToTSelectTable() {
    this.tableSelected = null;
  }

  private async handleLoadDatabases() {
    this.databaseStatus = Status.Loading;
    this.databaseError = '';
    if (ListUtils.isNotEmpty(this.databaseUniqueNames)) {
      try {
        const dbInfosAsFutures = this.databaseUniqueNames.map(dbName => this.schemaService.getDatabaseSchema(dbName));
        this.databaseInfos = await Promise.all(dbInfosAsFutures);
        this.loadDatabaseSelectedFromSession();
        if (!this.databaseSelected) {
          this.loadDatabaseSelectedFromUsedFrequency();
        }
        this.databaseStatus = Status.Loaded;
      } catch (ex) {
        this.handleErrorLoadDatabases(ex);
      }
    }
  }

  private handleErrorLoadDatabases(ex: any) {
    if (ex instanceof DIException) {
      this.databaseError = ex.message;
      this.databaseStatus = Status.Error;
    }
  }

  private loadDatabaseSelectedFromSession() {
    // this.dataManager.getDataSelected(this.id);
    if (this.dashboardId) {
      const dbSelected = this.dataManager.getDatabaseSelected(this.dashboardId);
      if (dbSelected) {
        this.databaseSelected = this.getDatabaseInfo(dbSelected);
      }
    }
  }

  private getDatabaseInfo(dbName: string) {
    return (this.databaseSelected = this.databaseInfos.find(dbInfo => dbInfo.name === dbName) ?? null);
  }

  private loadDatabaseSelectedFromUsedFrequency() {
    const dbSelected = DashboardModule.databaseHighestUsed;
    if (dbSelected) {
      this.databaseSelected = this.getDatabaseInfo(dbSelected);
    }
  }
}
</script>

<style lang="scss" scoped>
.db-listing-searchable {
  background-color: var(--primary);
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
  box-sizing: content-box;
  max-width: unset;
  padding: 16px;
  width: 311px;
  ///Not small than 10000
  z-index: 10000;

  ::v-deep {
    .arrow {
      display: none;
    }

    .popover-body {
      padding: 0 !important;
    }
  }
}
</style>
