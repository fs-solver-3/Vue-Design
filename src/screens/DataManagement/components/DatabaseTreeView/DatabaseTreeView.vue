<template>
  <div class="db-tree-view">
    <div class="db-sidebar-title">
      <div class="db-sidebar-title-body">
        <span v-if="!isShowKeyword">
          <span>
            DATABASE
            <span v-if="!loading">({{ schemas.length }})</span>
          </span>
          <i v-if="loading" class="fa fa-spin fa-spinner"></i>
          <div class="db-sidebar-title-actions" v-else>
            <slot name="header-action"></slot>
            <a @click.prevent="showKeyword" href="#">
              <img src="@/assets/icon/ic_search.svg" width="16" height="16" alt="" />
            </a>
          </div>
        </span>
        <div v-else class="input-group">
          <input ref="keyword" v-model.trim="keyword" @blur="hideKeyword" type="text" class="form-control" placeholder="Search database" />
          <span class="input-group-append">
            <a @click.prevent="resetKeyword" href="#">
              <img src="@/assets/icon/ic_close.svg" width="32" height="32" alt="" />
            </a>
          </span>
        </div>
      </div>
    </div>
    <div class="">
      <ul class="db-tree-view-body">
        <li @click.prevent="toggleDatabase(db)" v-for="db in filteredSchemas" :key="db.name">
          <div class="db-item">
            <i class="icon-database text-muted"></i>
            <!--            <i class="fa fa-database text-muted"></i>-->
            <div class="flex-grow-1 ml-2 mr-2">
              <span v-if="db.displayName">{{ db.displayName }}</span>
              <em v-else class="text-muted">{{ db.name }}</em>
            </div>
            <!--            <a @click.prevent.stop="toggleDatabase(db)" href="#" class="mr-2 text-muted">-->
            <!--              <i class="fa fa-caret-right" :class="{ 'fa-rotate-90': db.show }"></i>-->
            <!--            </a>-->

            <span v-if="loading" class="fa fa-spinner fa-spin ml-auto"></span>
            <a v-else @click.prevent.stop="toggleDatabase(db)" href="#" class="ml-auto text-muted">
              <i class="fa fa-angle-right" :class="{ 'fa-rotate-90': isExpandedDatabase(db) }"></i>
            </a>
          </div>
          <ul @click.prevent.stop v-if="isExpandedDatabase(db)" class="table-list">
            <li v-if="db.tables.length <= 0">
              <em class="table-item text-muted">No tables</em>
            </li>
            <!--            @click.prevent="selectTable(tb)"-->
            <li v-for="tb in db.tables" :key="tb.name">
              <slot name="table-item" v-bind="{ database: db, table: tb, toggleTable, isExpandedTable, showColumns }">
                <div v-if="!showColumns" class="table-item">
                  <span v-if="tb.displayName">{{ tb.displayName }}</span>
                  <em v-else class="text-muted">{{ tb.name }}</em>
                </div>
                <div v-else @click.prevent="toggleTable(db, tb)" class="table-item">
                  <i v-if="showColumns" class="table-icon fa fa-caret-right text-muted" :class="{ 'fa-rotate-90': isExpandedTable(db, tb) }"></i>
                  <span v-if="tb.displayName" class="table-name">{{ tb.displayName }}</span>
                  <em v-else class="text-muted table-name">{{ tb.name }}</em>
                </div>
              </slot>
              <ul v-if="showColumns && isExpandedTable(db, tb)" @click.stop class="column-list">
                <li v-if="tb.columns.length <= 0">
                  <em class="column-item text-muted">No columns</em>
                </li>
                <li v-for="col in tb.columns" :key="col.name">
                  <slot name="column-item" v-bind="{ database: db, table: tb, column: col, getColumnIcon }">
                    <div class="column-item">
                      <img :src="require(`@/assets/icon/${getColumnIcon(col)}`)" class="column-icon" />
                      <div class="column-name">
                        <span v-if="col.displayName">
                          {{ col.displayName }}
                        </span>
                        <em v-else class="text-muted">{{ col.name }}</em>
                      </div>
                    </div>
                  </slot>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>
<script src="./DatabaseTreeView.ctrl.ts" lang="ts"></script>
<style lang="scss" scoped>
$primary-color: #272a36;
$secondary-color: #333645;
$card-color: #2d303c;
$white-color: #fff;
$muted-color: rgba(255, 255, 255, 0.6);
$muted-border-color: rgba(255, 255, 255, 0.1);
$header-color: #4a506a;
$body-color-odd: #2b2e3a;
$body-color-even: #2f3240;
$card-spacing: 16px;
.db-tree-view {
  width: 250px;
  background-color: $card-color;
  border-radius: 4px;
  margin-right: 20px;
  padding: 0;
  overflow-y: auto;

  .db-sidebar-title {
    font-weight: 600;
    padding: 10px 6px;
    position: sticky;
    top: 0;
    background-color: $card-color;
    z-index: 1;
  }

  .db-sidebar-title-body {
    height: 34px;
    display: flex;

    & > span {
      flex: 1;
      padding: 0 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .input-group {
      padding: 0 0 0 10px;
      .form-control {
        padding-left: 10px;
      }
    }

    .db-sidebar-title-actions {
      display: flex;
      align-items: center;
      line-height: 1;

      a {
        display: flex;
      }
    }
  }

  .db-tree-view-body {
    list-style: none;
    padding: 0 10px;
    margin-bottom: 20px !important;

    li {
      .db-item {
        min-height: 34px;
        font-weight: 500;
        padding: 8px 6px;
        display: flex;
        cursor: pointer;
        border-radius: 4px;
        align-items: flex-start;
        word-break: break-word;
        text-align: left;

        &,
        * {
          line-height: 1.4;
        }

        &:hover {
          background-color: $secondary-color;
        }
      }
    }

    .table-list {
      list-style: none;
      padding: 0;

      .table-item {
        position: relative;
        text-decoration: none;
        min-height: 34px;
        align-items: flex-start;
        padding: 6px 4px 6px 30px;
        display: flex;
        cursor: pointer;
        border-radius: 4px;
        color: $white-color;
        text-align: left;
        //justify-content: flex-start;
        //align-items: flex-start;

        .table-name {
          flex: 1;
          word-break: break-word;
        }

        .table-icon {
          margin: 4px 1rem 0 0;
        }

        &:hover {
          background-color: $secondary-color;
        }

        a:hover {
          border-radius: 2px;
          background-color: rgba(246, 245, 245, 0.1);
        }
      }
    }

    .column-list {
      list-style: none;
      padding: 0;
      text-align: left;
      .column-item {
        padding: 6px 4px 6px 50px;
        font-weight: 500;
        display: flex;
        align-items: flex-start;
        cursor: default;
        &:hover {
          border-radius: 4px;
          background-color: $secondary-color;
        }

        .column-icon {
          margin: 4px 8px 0 0;
          width: 14px;
          height: 14px;
        }

        .column-name {
          flex: 1;
          word-break: break-word;
        }

        a:hover {
          border-radius: 2px;
          background-color: rgba(246, 245, 245, 0.1);
        }
      }
    }
  }
}
</style>
