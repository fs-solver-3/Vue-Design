<template>
  <div class="data-management-body-content">
    <DatabaseTreeView class="left-panel" :schemas="databaseSchemas" :loading="loadingDatabaseSchemas">
      <template slot="table-item" slot-scope="{ database, table }">
        <div @dragend="onDragEnd" @dragstart="e => onDragStart(e, database, table)" @dragleave="onDragLeave" draggable="true" class="table-item">
          <span v-if="table.displayName">{{ table.displayName }}</span>
          <em v-else class="text-muted">{{ table.name }}</em>
        </div>
      </template>
    </DatabaseTreeView>
    <div class="right-panel d-flex flex-column data-schema">
      <div :class="{ draging: isDraging }" class="di-theme db-relationship-editor-container">
        <div ref="relationshipEditor" class="db-relationship-editor">
          <div @dragover="onDragOver" @drop="onDrop" ref="container" class="db-relationship-editor-body">
            <div v-if="!addedTables.length" class="data-management-tips">
              <div class="data-management-tips--icon">
                <i class="di-icon-relationship"></i>
              </div>
              <div class="data-management-tips--title">
                DRAG AND DROP TABLE HERE!
              </div>
            </div>
            <TableItem
              @newConnection="onNewConnection"
              @remove="removeTable"
              @showAllRelationship="showAllRelationship"
              v-for="tb in addedTables"
              :key="tb.name"
              :table="tb"
              :highlight="tb === highlightedTable"
              :loading="isLoadingRelationship(tb)"
            >
              <template slot="database-name">
                <span v-if="mapDatabase[tb.dbName]">
                  {{ mapDatabase[tb.dbName].displayName || tb.dbName }}
                </span>
              </template>
            </TableItem>
          </div>
          <div v-if="loading" class="db-relationship-loading">
            <i class="fa fa-spin fa-spinner"></i>
          </div>
        </div>
        <div class="w-100 text-right mt-3 d-flex">
          <div v-if="error" class="d-flex flex-column justify-content-center align-items-start flex-grow-1 text-danger">
            <div>Error when update changes.</div>
            <div v-for="(e, idx) in errors" :key="idx">
              <small>{{ e[1] }}</small>
            </div>
          </div>
          <div class="ml-auto">
            <button @click.prevent="discardChanges" :disabled="!canSave" class="btn btn-di btn-di-transparent">Discard changes</button>
            <button @click.prevent="save" :disabled="!canSave" class="btn btn-di btn-di-primary">
              <template v-if="error">Re-try</template>
              <template v-else>Save</template>
            </button>
          </div>
        </div>
        <!--    <DiModal @hide="resetData" ref="modal" title="Relationship Management" size="xxl" :keyboard="false" backdrop="static" body-class="modal-body-custom">-->
        <!--      <div class="db-relationship">-->
        <!--        <div class="db-sidebar">-->
        <!--          <div class="db-sidebar-title">-->
        <!--            <div class="db-sidebar-title-body">-->
        <!--              <span v-if="!isShowKeyword">-->
        <!--                Database-->
        <!--                <a @click.prevent="showKeyword" href="#">-->
        <!--                  <img src="@/assets/icon/ic_search.svg" width="16" height="16" alt="" />-->
        <!--                </a>-->
        <!--              </span>-->
        <!--              <div v-else class="input-group">-->
        <!--                <input ref="keyword" v-model.trim="keyword" @blur="hideKeyword" type="text" class="form-control" placeholder="Search database" />-->
        <!--                <span class="input-group-append">-->
        <!--                  <a @click.prevent="resetKeyword" href="#">-->
        <!--                    <img src="@/assets/icon/ic_close.svg" width="40" height="40" alt="" />-->
        <!--                  </a>-->
        <!--                </span>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--          <div class="db-sidebar-body">-->
        <!--            <ul class="list-db">-->
        <!--              <li @click.prevent="toggleDatabase(db)" v-for="db in filteredDatabases" :key="db.name">-->
        <!--                <div class="db-item">-->
        <!--                  <a @click.prevent.stop="toggleDatabase(db)" href="#" class="mr-2 text-muted">-->
        <!--                    <i class="fa fa-caret-right" :class="{ 'fa-rotate-90': db.show }"></i>-->
        <!--                  </a>-->
        <!--                  <span v-if="db.displayName">{{ db.displayName }}</span>-->
        <!--                  <em v-else class="text-muted">{{ db.name }}</em>-->
        <!--                  <span v-if="db.loading" class="fa fa-spinner fa-spin ml-auto"></span>-->
        <!--                </div>-->
        <!--                <ul @click.stop v-if="db.show && !db.loading" class="table-list">-->
        <!--                  <li v-if="databases.mapDetail[db.name].tables.length <= 0">-->
        <!--                    <em class="table-item text-muted">No tables</em>-->
        <!--                  </li>-->
        <!--                  <li v-for="tb in databases.mapDetail[db.name].tables" :key="tb.name">-->
        <!--                    <div @dragstart="e => onDragStart(e, db, tb)" @dragleave="e => onDragLeave(e, db, tb)" draggable="true" @click.stop class="table-item">-->
        <!--                      <span v-if="tb.displayName">{{ tb.displayName }}</span>-->
        <!--                      <em v-else class="text-muted">{{ tb.name }}</em>-->
        <!--                      &lt;!&ndash;                      <div class="dropdown d-inline ml-auto">&ndash;&gt;-->
        <!--                      &lt;!&ndash;                        <a href="#" data-toggle="dropdown">&ndash;&gt;-->
        <!--                      &lt;!&ndash;                          <img src="@/assets/icon/charts/ic_more.svg" width="12" height="12" />&ndash;&gt;-->
        <!--                      &lt;!&ndash;                        </a>&ndash;&gt;-->
        <!--                      &lt;!&ndash;                        <div class="dropdown-menu dropdown-menu-right">&ndash;&gt;-->
        <!--                      &lt;!&ndash;                          <a @click.prevent="showAllRelationship(db, tb)" href="#" class="dropdown-item">View all relationship</a>&ndash;&gt;-->
        <!--                      &lt;!&ndash;                        </div>&ndash;&gt;-->
        <!--                      &lt;!&ndash;                      </div>&ndash;&gt;-->
        <!--                    </div>-->
        <!--                  </li>-->
        <!--                </ul>-->
        <!--              </li>-->
        <!--            </ul>-->
        <!--          </div>-->
        <!--        </div>-->
        <!--        <div ref="relationshipEditor" class="db-relationship-editor">-->
        <!--          <div @dragover="onDragOver" @drop="onDrop" ref="container" class="db-relationship-editor-body">-->
        <!--            <div v-if="!addedTables.length" class="db-relationship-editor-tip">-->
        <!--              <img src="/img/icons/relationship.svg" alt="" />-->
        <!--              <div>-->
        <!--                DRAG AND DROP TABLE HERE!-->
        <!--              </div>-->
        <!--            </div>-->
        <!--            <TableItem-->
        <!--              @newConnection="onNewConnection"-->
        <!--              @remove="removeTable"-->
        <!--              @showAllRelationship="showAllRelationship"-->
        <!--              v-for="tb in addedTables"-->
        <!--              :key="tb.name"-->
        <!--              :table="tb"-->
        <!--              :highlight="tb === highlightedTable"-->
        <!--              :loading="isLoadingRelationship(tb)"-->
        <!--            >-->
        <!--              <template slot="database-name">-->
        <!--                <span v-if="databases.mapDetail[tb.dbName]">-->
        <!--                  {{ databases.mapDetail[tb.dbName].displayName || tb.dbName }}-->
        <!--                </span>-->
        <!--              </template>-->
        <!--            </TableItem>-->
        <!--          </div>-->
        <!--        </div>-->
        <!--      </div>-->
        <!--      <template slot="footer" slot-scope="{ hide }">-->
        <!--        <div class="w-100 text-right">-->
        <!--          <button @click.prevent="hide" class="btn btn-di btn-di-transparent">Cancel</button>-->
        <!--          <button @click.prevent="save" :disabled="!canSave" class="btn btn-di btn-di-primary">Save</button>-->
        <!--        </div>-->
        <!--      </template>-->
        <!--    </DiModal>-->
        <div ref="contextMenu" class="dropdown di-context-menu">
          <div class="dropdown-menu">
            <a @click.prevent="removeRelationship" href="#" class="dropdown-item">Remove relationship</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./DataRelationship.ctrl.ts"></script>
<style src="./DataRelationship.style.scss" lang="scss"></style>
