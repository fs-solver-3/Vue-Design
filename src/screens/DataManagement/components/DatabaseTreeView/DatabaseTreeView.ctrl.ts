import { Component, Ref, Vue, Prop } from 'vue-property-decorator';
import { Column, DatabaseInfo, DatabaseSchema, TableSchema } from '@core/domain';
import { IconUtils } from '@/utils';

type MapExpandedDatabase = {
  [key: string]: {
    show: boolean;
    table: {
      [key: string]: boolean;
    };
  };
};

@Component
export default class DatabaseTreeView extends Vue {
  @Prop({ type: Boolean })
  private loading!: boolean;

  @Prop({ type: Boolean, default: false })
  private showColumns!: boolean;

  @Prop({ type: Array, default: () => [] })
  private databases!: DatabaseInfo[];

  @Prop({ type: Array, default: () => [] })
  private schemas!: DatabaseSchema[];

  isShowKeyword = false;
  keyword = '';
  mapExpanded: MapExpandedDatabase = {};
  selectedTable: TableSchema | null = null;

  @Ref('keyword')
  private readonly keywordEle?: HTMLElement;

  get filteredDatabases(): DatabaseInfo[] {
    if (this.keyword) {
      const keyword = this.keyword.toLowerCase();
      return this.databases.filter(item => item.displayName.toLowerCase().indexOf(keyword) >= 0 || item.name.toLowerCase().indexOf(keyword) >= 0);
    }
    return this.databases;
  }

  get filteredSchemas(): DatabaseSchema[] {
    if (this.keyword) {
      const keyword = this.keyword.toLowerCase();
      return this.schemas.filter(item => {
        return item.keyword.toLowerCase().indexOf(keyword) >= 0;
        // return item.displayName.toLowerCase().indexOf(keyword) >= 0 || item.name.toLowerCase().indexOf(keyword) >= 0;
      });
    }
    return this.schemas;
  }

  private resetKeyword() {
    this.keyword = '';
    this.isShowKeyword = false;
  }

  showKeyword() {
    this.isShowKeyword = true;
    this.$nextTick(() => {
      this.keywordEle?.focus();
    });
  }

  private hideKeyword() {
    if (!this.keyword) {
      this.isShowKeyword = false;
    }
  }

  private toggleDatabase(schema: DatabaseSchema) {
    const isShowing = this.mapExpanded[schema.name]?.show;
    this.$set(this.mapExpanded, schema.name, {
      show: !isShowing,
      table: {}
    });
  }

  private toggleTable(schema: DatabaseSchema, table: TableSchema) {
    if (!this.mapExpanded[schema.name]) {
      this.$set(this.mapExpanded, schema.name, {
        show: !this.mapExpanded[schema.name].show,
        table: {}
      });
    }
    this.$set(this.mapExpanded[schema.name].table, table.name, !this.mapExpanded[schema.name].table[table.name]);
  }

  private isExpandedDatabase(schema: DatabaseSchema) {
    return this.mapExpanded[schema.name]?.show;
  }

  private isExpandedTable(schema: DatabaseSchema, table: TableSchema) {
    return this.mapExpanded[schema.name]?.table?.[table.name];
  }

  private getColumnIcon(column: Column) {
    return IconUtils.getIcon(column);
  }
}
