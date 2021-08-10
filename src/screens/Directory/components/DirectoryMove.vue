<template>
  <b-modal ref="mdMoveDirectory" id="mdMoveDirectory" centered>
    <template v-slot:modal-header="{ close }">
      <div>
        <img class="icon-title h-42px" src="@/assets/icon/ic_arrow_left.svg" alt />
        <span class="text-14px">{{ title }}</span>
      </div>
      <p class="h5 mb-2">
        <b-icon-x role="button" variant="light" @click="close()"></b-icon-x>
      </p>
    </template>
    <template v-slot:default="">
      <b-table
        ref="tblDirectoryMove"
        show-empty
        responsive
        selectable
        table-variant="dark"
        select-mode="single"
        :items="items"
        :fields="fields"
        @row-dblclicked="selectedRow"
        @row-selected="onRowSelected"
        thead-class="thead-hidden"
        tbody-tr-class="primary-background-color"
        selected-variant="td-background-color-active"
      >
        <template v-slot:cell(name)="row">
          <b-icon-folder-fill />
          <span class="ml-3">{{ row.item.name }}</span>
        </template>
        <template v-slot:cell(selected)="{ rowSelected }">
          <template v-if="rowSelected">
            <b-icon-chevron-right />
          </template>
        </template>
      </b-table>
    </template>
    <template v-slot:modal-footer="">
      <DiButton :id="genBtnId('add-new-folder')" title="New folder" class="mr-auto margin-left-10px-negative h-42px" v-on:click="addNewFolder()">
        <img class="icon-title p-2" src="@/assets/icon/ic_add.svg" alt />
      </DiButton>
      <b-button :id="genBtnId('move-here')" class="w-50 h-42px" variant="primary" @click="move()">
        Move here
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';
import { DirectoryId, Directory } from '@core/domain/Model';
import { DirectoryModule } from '@/screens/Directory/store/directory.store';
import { Log } from '@core/utils';

@Component
export default class DirectoryMove extends Vue {
  $refs!: {
    mdMoveDirectory: BModal;
  };
  directoryId?: DirectoryId;
  currentParent?: Directory;
  items: any[];
  fields: any[];
  title: string;

  private newParrentId?: DirectoryId;
  constructor() {
    super();
    this.title = 'My data';
    // TODO: it's temp data, need to update late
    this.items = [
      {
        id: 1,
        name: 'Customer demands'
      },
      {
        id: 2,
        name: 'Business 2017'
      },
      {
        id: 3,
        name: 'Customer trending'
      },
      {
        id: 4,
        name: 'Marketing test'
      }
    ];
    this.fields = [
      {
        key: 'name',
        sortable: false,
        label: 'Name',
        tdClass: 'td-text-style-primary text-left td-disable-after',
        thClass: 'th-text-style text-left'
      },
      {
        key: 'selected',
        tdClass: 'td-text-style-primary text-right td-disable-after',
        thClass: 'th-text-style text-right'
      }
    ];
  }

  show(directoryId: DirectoryId, currentParent: Directory) {
    this.directoryId = directoryId;
    this.currentParent = currentParent;
    if (this.currentParent.parentId > 0) {
      this.title = this.currentParent.name;
    }
    //TODO: get all folder for current parent to listing on UI
    this.$refs.mdMoveDirectory.show();
  }

  selectedRow(item: any, index: number, event: any) {
    Log.debug(item);
  }

  addNewFolder() {
    Log.debug('addNewFolder');
  }

  move() {
    if (this.newParrentId && this.directoryId) {
      DirectoryModule.move({
        id: this.directoryId,
        toParentId: this.newParrentId
      });
      this.$refs.mdMoveDirectory.hide();
    }
  }

  onRowSelected(item: any) {
    Log.debug(item);
  }
}
</script>

<style lang="scss" scoped></style>
