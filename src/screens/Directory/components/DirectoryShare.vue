<template>
  <b-modal ref="mdShareDirectory" id="mdShareDirectory" centered>
    <template v-slot:modal-header="{ close }">
      <h6 class="mt-2 text-14px">Share with people and group</h6>
      <p class="h6 mt-1 btn-ghost">
        <img class="icon-title ic-16" @click="close()" src="@/assets/icon/ic_setting.svg" alt />
      </p>
    </template>

    <template v-slot:default="{ cancel }">
      <div class="d-flex flex-column mt-2">
        <label class="text-12px-opacity  text-uppercase">Add people and group</label>
        <b-input placeholder="Type here to add" variant="dark" class="p-3 h-42px"></b-input>
      </div>
      <div class="d-flex flex-row mt-3">
        <div class="d-flex flex-row align-items-center">
          <img class="icon-title rounded-circle ic-40" src="https://media.laodong.vn/Storage/NewsPortal/2020/3/25/793308/Yoona-01.jpg" alt />
        </div>
        <div class="d-flex flex-column ml-3">
          <label class="text-14px-opacity">Duc Nguyen (You) - <b>Owner</b></label>
          <label class="text-12px">dinhducit@gmail.com</label>
        </div>
      </div>
      <hr class="hr-primary-color" />
      <div class="d-flex">
        <b-button class="flex-fill text-white h-42px mr-1" variant="secondary" @click="cancel()">
          Cancel
        </b-button>
        <b-button class="flex-fill h-42px ml-1" variant="primary" @click="done()">
          Done
        </b-button>
      </div>
    </template>

    <div>
      sad
    </div>
    <template v-slot:modal-footer="">
      <div class="d-flex flex-column mr-auto">
        <label class="text-14px">Get link</label>
        <label class="text-12px">Anyone on the internet with this link can view</label>
      </div>
      <div class="d-flex flex-row ml-auto align-items-center">
        <a href="#" class="mr-2 text-14px-secondary-color">Copy</a>
        <a href="#" class="ml-2 text-14px-secondary-color">Reset</a>
      </div>
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
export default class DirectoryShare extends Vue {
  $refs!: {
    mdShareDirectory: BModal;
  };
  directoryId?: DirectoryId;
  currentParent?: Directory;
  items: any[];
  fields: any[];
  title: string;
  selected: any;

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
        tdClass: 'td-text-style-primary text-left',
        thClass: 'th-text-style text-left'
      },
      {
        key: 'selected',
        tdClass: 'td-text-style-primary text-right',
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
    this.$refs.mdShareDirectory.show();
  }

  selectedRow(item: any, index: number, event: any) {
    Log.debug(item);
  }

  addNewFolder() {
    Log.debug('addNewFolder');
  }

  done() {
    if (this.newParrentId && this.directoryId) {
      DirectoryModule.move({
        id: this.directoryId,
        toParentId: this.newParrentId
      });
      this.$refs.mdShareDirectory.hide();
    }
    Log.debug('taolaobidao');
  }

  onRowSelected(item: any) {
    Log.debug(item);
    this.selected = item;
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';
@import '~@/themes/scss/di-variables';

.text-12px-opacity {
  @include regular-text;
  opacity: 0.5;
  font-size: 12px !important;
  color: $primaryTextColor;
}

.text-12px {
  @include regular-text;
  letter-spacing: 0.51px !important;
  font-size: 12px !important;
  color: $primaryTextColor;
}

.text-14px-secondary-color {
  @include regular-text;
  font-size: 14px !important;
  color: $accentColor;
}

.text-14px-opacity {
  @include regular-text;
  opacity: 0.8;
  font-size: 14px !important;
  letter-spacing: 0.6px;
  color: $primaryTextColor;
}

.text-14px {
  @include regular-text;
  font-size: 14px !important;
  letter-spacing: 0.6px;
  color: $primaryTextColor;
}

.text-white {
  @include regular-text;
  letter-spacing: 0.18px;
  text-align: center;
  color: $primaryTextColor;
}

.hr-primary-color {
  border-top: 0.5px solid #000 !important;
  opacity: 0.5;
}
</style>
