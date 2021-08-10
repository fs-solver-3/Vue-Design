<template>
  <div class="item">
    <DynamicFilterPanel
      :id="filterId"
      :filter.sync="currentFilter"
      :isShowDisable="false"
      :maxChipShowing="3"
      placement="top"
      @onApplyFilter="handleApplyFilter"
      @onRemove="handleDeleteFilter"
      @onValuesChanged="handleApplyFilter"
    >
      <template #conditionName>
        <ChangeFieldButton
          :conditionTreeNode="conditionTreeNode"
          :error-message="errorMessage"
          :field-context-status="fieldContextStatus"
          :nodeIndex="nodeIndex"
          :profile-fields="profileFields"
          :title="conditionTreeNode.title"
          @handleChangeField="handleChangeField(andGroup, conditionTreeNode, nodeIndex, ...arguments)"
          @handleClickButton="handleOnClickField"
        >
        </ChangeFieldButton>
      </template>
    </DynamicFilterPanel>
    <img :style="{ opacity: opacity }" alt="edit" class="more-icon btn-ghost-alter" src="@/assets/icon/charts/ic_more.svg" @click="handleOpenMenu" />
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import { ConditionTreeNode, Status } from '@/shared';
import { DatabaseSchemaModule } from '@/store/modules/data_builder/database_schema.store';
import { DatabaseSchema, DynamicFilter } from '@core/domain/Model';
import { ChartUtils, SchemaUtils, TimeoutUtils } from '@/utils';
import { cloneDeep } from 'lodash';
import ChangeFieldButton from '@/screens/ChartBuilder/components/ChangeFieldButton.vue';
import DynamicFilterPanel from '@/shared/components/filters/DynamicFilterPanel/DynamicFilterPanel.vue';
import { FieldDetailInfo } from '@core/domain/Model/Function/FieldDetailInfo';

@Component({
  components: {
    ChangeFieldButton,
    DynamicFilterPanel
  }
})
export default class FilterItem extends Vue {
  private errorMessage = '';
  private fieldContextStatus = Status.Loaded;
  private profileFields: FieldDetailInfo[] = [];

  @Prop({ required: true, type: Array })
  private andGroup!: ConditionTreeNode[];

  @Prop({ required: true, type: Number })
  private groupIndex!: number;

  @Prop({ required: true, type: Number })
  private nodeIndex!: number;

  @Prop({ required: true })
  private conditionTreeNode!: ConditionTreeNode;

  @Prop({ required: true, type: Number })
  private opacity!: number;

  @Prop({ required: false, type: Function, default: undefined })
  private readonly fnShowFilter?: (filterId: number) => void;

  private currentFilter: DynamicFilter = DynamicFilter.empty();

  // id pattern: filter-[groupId]-[nodeId]
  @Prop({ required: true, type: String })
  private readonly filterId!: string;

  @Watch('conditionTreeNode', { immediate: true, deep: true })
  handleOnConditionNodeChanged() {
    if (this.conditionTreeNode.field && SchemaUtils.isDiff(this.currentFilter.field, this.conditionTreeNode.field)) {
      const clonedNode = cloneDeep(this.conditionTreeNode);
      this.currentFilter = this.getDynamicFilter(clonedNode);
    }
  }

  private isDbAlreadyLoaded(dbName: string) {
    return dbName === DatabaseSchemaModule.dbNameSelected;
  }

  private handleOnClickField(data: { conditionTreeNode: ConditionTreeNode; index: number }) {
    if (data.conditionTreeNode) {
      const selectedConditionNode = ChartUtils.toConditionData(data.conditionTreeNode);
      if (DatabaseSchemaModule.databaseSchema && this.isDbAlreadyLoaded(selectedConditionNode.field.dbName)) {
        this.loadProfileFields(DatabaseSchemaModule.databaseSchema, selectedConditionNode.field.tblName);
      } else {
        DatabaseSchemaModule.handleGetDatabaseSchema(selectedConditionNode.field.dbName)
          .then(selectedDatabaseSchema => this.loadProfileFields(selectedDatabaseSchema, selectedConditionNode.field.tblName))
          .catch(e => {
            this.fieldContextStatus = Status.Error;
            this.errorMessage = 'Load table error, try again';
          });
      }
    }
  }

  private loadProfileFields(databaseSchema: DatabaseSchema, tblName: string) {
    this.fieldContextStatus = Status.Loaded;
    this.profileFields = ChartUtils.getProfileFieldsFromDBSchemaTblName(databaseSchema, tblName);
  }

  @Emit('onFilterChanged')
  private handleChangeField(
    group: ConditionTreeNode[],
    conditionTreeNode: ConditionTreeNode,
    nodeIndex: number,
    profileField: FieldDetailInfo
  ): [ConditionTreeNode[], ConditionTreeNode, number] {
    const newNode: ConditionTreeNode = this.handleMergeField(conditionTreeNode, profileField);
    if (conditionTreeNode.field && SchemaUtils.isDiff(conditionTreeNode.field, profileField.field)) {
      ChartUtils.resetNodeData(newNode);
    }
    return [group, newNode, nodeIndex];
  }

  private handleMergeField(conditionTreeNode: ConditionTreeNode, profileField: FieldDetailInfo) {
    const clonedNode = cloneDeep(conditionTreeNode);
    clonedNode.field = profileField.field;
    clonedNode.title = profileField.displayName;
    return clonedNode;
  }

  private handleOpenMenu(mouseEvent: MouseEvent): void {
    const data = [
      mouseEvent,
      {
        conditionTreeNode: this.conditionTreeNode,
        i: this.groupIndex,
        j: this.nodeIndex,
        editFn: this.showFilter
      }
    ];
    // workaround: don't use event.stopPropagation(), because other popup will not close.
    TimeoutUtils.waitAndExec(null, () => this.$emit('onOpenMenu', data), 80);
  }

  @Emit('onClickFilter')
  private showFilter(): string {
    return this.filterId;
  }

  private getDynamicFilter(conditionTreeNode: ConditionTreeNode) {
    if (conditionTreeNode.field) {
      const filter = DynamicFilter.from(
        conditionTreeNode.field,
        conditionTreeNode.title,
        SchemaUtils.isNested(conditionTreeNode.field.tblName),
        this.conditionTreeNode.id
      );
      this.setExtraData(filter, conditionTreeNode);
      return filter;
    } else {
      return DynamicFilter.empty();
    }
  }

  private setExtraData(filter: DynamicFilter, conditionTreeNode: ConditionTreeNode) {
    filter.currentValues = conditionTreeNode.allValues;
    filter.filterModeSelected = conditionTreeNode.filterModeSelected;
    filter.currentInputType = conditionTreeNode.currentInputType;
    filter.currentOptionSelected = conditionTreeNode.currentOptionSelected;
  }

  @Emit('onFilterChanged')
  private handleApplyFilter(): [ConditionTreeNode[], ConditionTreeNode, number] {
    const newFilter = this.currentFilter;
    this.currentFilter = newFilter;
    const clonedNode = this.updateConditionNode(this.conditionTreeNode, newFilter);
    return [this.andGroup, clonedNode, this.nodeIndex];
  }

  private updateConditionNode(conditionTreeNode: ConditionTreeNode, newFilter: DynamicFilter) {
    const newNode: ConditionTreeNode = cloneDeep(this.conditionTreeNode);
    newNode.allValues = newFilter.currentValues;
    newNode.firstValue = newFilter.currentValues[0];
    newNode.secondValue = newFilter.currentValues[1];

    newNode.filterModeSelected = newFilter.filterModeSelected;
    newNode.currentInputType = newFilter.currentInputType;
    newNode.currentOptionSelected = newFilter.currentOptionSelected;
    newNode.filterType = newFilter.currentOptionSelected;

    return newNode;
  }

  @Emit('onDeleteFilter')
  private handleDeleteFilter(): [number, number] {
    return [this.groupIndex, this.nodeIndex];
  }
}
</script>

<style lang="scss" scoped>
@import '~bootstrap/scss/bootstrap-grid.scss';

.item {
  align-items: flex-start;
  justify-content: center;
  display: flex;
  flex-wrap: nowrap;
  padding: 4px 8px;
  text-align: left;
  width: 100%;
  overflow: hidden;

  > div {
    width: 100%;
  }

  &:not(:first-child) {
    margin-top: 8px;
  }

  .more-icon {
    cursor: pointer;
    height: 20px;
    margin-left: auto;
    padding: 4px;
    width: 20px;
  }
}

::v-deep {
  .view-panel {
    background-color: transparent;
    padding: 0;
  }
}
</style>
