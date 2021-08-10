<template>
  <b-modal ref="mdShare" id="mdShare" class="modal-content" centered @ok="done" @hide="handleClose">
    <template #modal-header="{ close }">
      <b-container class="pad-15" @click.prevent="isExpanded && toggleExpanded()" :class="getCursorClassForHeader">
        <div v-if="isExpanded" :key="'collapsed'">
          <h6 class="mt-2 text-14px">Share with people and group</h6>
          <div class="text-12px-opacity">No one has been added yet</div>
        </div>
        <b-container v-else class="d-flex flex-row justify-content-between p-md-0" :key="'expanded'">
          <h6 class="mt-2 text-14px">Share with people and group</h6>
          <div class="h6 mt-1 text-center align-items-center">
            <img class="icon-title ic-16 btn-ghost icon-setting opacity-0dot5" @click.prevent="close" src="@/assets/icon/close.svg" alt />
          </div>
        </b-container>
      </b-container>
    </template>
    <template #default="{ cancel, ok }">
      <CollapseTransition>
        <b-container v-if="isCollapsed" class="p-md-0 pad-y-15" v-bind:key="'collapsed'">
          <div class="d-flex flex-column mt-2 text-uppercase">
            <label class="text-12px-opacity">Add people and group</label>
            <b-input v-model="searchInput" id="searchInput" placeholder="Type here to add" variant="dark" class="p-3 h-42px" debounce="300"></b-input>
            <UserItemListing
              target="searchInput"
              :is-show-popover.sync="isShowPopover"
              :data="suggestedUsers"
              @handleClickUserItem="handleClickUserItem"
              :status="getSuggestUserStatus"
              :error="suggestUserError"
            ></UserItemListing>
          </div>
          <StatusWidget :status="getSharedUserStatus" :error="getSharedUserError"></StatusWidget>
          <UserItemStatusListing
            v-if="isGetSharedUserLoaded"
            :owner="sharedUsersResponse.owner"
            :resource-id="resourceId"
            :resource-type="resourceType"
            :data="sharedUsersResponse.usersSharing"
            :status-data="swmStatusData"
            @handleItemStatusChange="handleSharePermissionChange"
          ></UserItemStatusListing>
          <hr class="divider-top" />
          <div class="d-flex mb-3">
            <b-button :id="genBtnId('share-cancel')" class="flex-fill text-white h-42px m-1" variant="secondary" @click="cancel">
              Cancel
            </b-button>
            <b-button :id="genBtnId('share-done')" class="flex-fill h-42px m-1" variant="primary" @click="ok">
              Done
            </b-button>
          </div>
        </b-container>
      </CollapseTransition>
    </template>
    <template #modal-footer="{ close, cancel, ok }">
      <CollapseTransition>
        <b-container fluid="" class="m-0 p-3" :class="getCursorClassForFooter" @click.prevent="isCollapsed && toggleExpanded()">
          <b-container v-if="isExpanded" class="d-flex flex-column" :key="'collapsed'">
            <b-row>
              <b-col class=" p-md-0">
                <label class="text-14px-opacity">Get link</label>
              </b-col>
              <b-col align="end" class="p-md-0 ic-24">
                <p class="h6">
                  <img class="icon-title ic-16 btn-ghost icon-setting opacity-0dot5" @click="close()" src="@/assets/icon/close.svg" alt />
                </p>
              </b-col>
            </b-row>
            <b-row>
              <b-input-group>
                <b-input plaintext :value="link" size="sm" class="p-3 h-42px width-fit input-link cursor-default"></b-input>
                <b-input-group-append class="d-flex flex-row ml-auto copy-reset align-content-center justify-content-center align-items-center align-middle">
                  <a
                    href="#"
                    :id="genBtnId('copy-share-link')"
                    class="mr-2 mt-0 text-14px-secondary-color"
                    v-clipboard:copy="link"
                    v-clipboard:success="onCopy"
                    v-clipboard:error="onError"
                  >
                    Copy
                  </a>
                  <b-tooltip id="copy-tooltip" placement="left" :disabled="true" :target="genBtnId('copy-share-link')">
                    <div class="custom-tooltip-body tooltip-basic-bg">{{ copyStatus }}</div>
                  </b-tooltip>
                  <!--              <a href="#" class="ml-2 mr-2 mt-0 text-14px-secondary-color">Copy</a>-->
                </b-input-group-append>
              </b-input-group>
            </b-row>
            <br />
            <b-row>
              <b-col lg="1" md="1" class="p-md-0">
                <div class="circle">
                  <img src="@/assets/icon/ic_globe.svg" class="icon-title rounded-circle ic-24 icon-img" />
                </div>
              </b-col>
              <b-col lg="8" md="7">
                <div class="d-flex flex-column">
                  <label class="text-14px">Anyone with the link</label>
                  <label class="text-12px">Anyone on the internet with this link can <span v-if="isEdit">edit</span> <span v-else>view</span></label>
                </div>
              </b-col>
              <b-col lg="3" md="4" class="p-md-0 ">
                <DiDropdown :id="genDropdownId('share-anyone')" :data="permissionTypes" v-model="currentPermission" value-props="type" />
              </b-col>
            </b-row>
            <hr class="divider-bottom" />
            <div class="d-flex">
              <b-button :id="genBtnId('share-anyone-cancel')" class="flex-fill text-white h-42px m-1" variant="secondary" @click="cancel">
                Cancel
              </b-button>
              <b-button :id="genBtnId('share-anyone-done')" class="flex-fill h-42px m-1" variant="primary" @click="ok">
                Done
              </b-button>
            </div>
          </b-container>
          <b-container fluid="" v-if="isCollapsed" class="px-0 d-flex flex-row justify-content-between flex-auto" :key="'expanded'">
            <div class="d-flex flex-column mr-auto">
              <label class="text-14px">Get link</label>
              <label class="text-12px">Anyone on the internet with this link can <span v-if="isEdit">edit</span> <span v-else>view</span></label>
            </div>
            <div class="d-flex flex-row ml-auto align-items-center" ref="container">
              <!--              todo: don't delete this line below-->
              <b-input plaintext :value="link" size="sm" class="p-3 h-42px width-fit input-link cursor-default d-none"></b-input>
              <a href="#" :id="genBtnId('quick-copy')" class="mr-2 text-14px-secondary-color" @click.stop="handleCopyLinkShare"> Copy </a>
              <b-tooltip id="quick-copy-tooltip" placement="left" :disabled="true" :target="genBtnId('quick-copy')">
                <div class="custom-tooltip-body" :class="tooltipBackground">
                  {{ copyStatus }}
                </div>
              </b-tooltip>
              <!--              <a href="#" class="ml-2 text-14px-secondary-color">Reset</a>-->
            </div>
          </b-container>
        </b-container>
      </CollapseTransition>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { Component, Ref, Vue, Watch } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';
import { ActionNode, Status } from '@/shared';
import { Log, UrlUtils } from '@core/utils';
import { ShareModule } from '@/store/modules/share.store';
import { ActionType, editActions, ResourceType } from '@/utils/permission_utils';
import { CollapseTransition, FadeTransition } from 'vue2-transitions';
import { PermissionTokenResponse } from '@core/domain/Response';
import VueClipboard from 'vue-clipboard2';
import UserItemStatusListing from '@/shared/components/UserItemStatusListing.vue';
import UserItemListing from '@/shared/components/UserItemListing.vue';
import { UserProfile } from '@core/domain/Model';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import { PopupUtils } from '@/utils/popup.utils';
import { GetUserSharingInfoRequest } from '@core/domain/Request/ShareRequest';
import { PermissionProviders } from '@core/admin/domain/permissions/PermissionProviders';
import { UserSharingInfo } from '@core/domain/Response/ResouceSharing/UserSharingInfo';
import { ResourceSharingInfo } from '@core/domain/Response/ResouceSharing/ResourceSharingInfo';

VueClipboard.config.autoSetContainer = true;
Vue.use(VueClipboard);

export enum CopyStatus {
  Failed = 'Failed',
  Success = 'Copied'
}

@Component({
  components: {
    StatusWidget,
    UserItemListing,
    UserItemStatusListing,
    CollapseTransition,
    FadeTransition
  }
})
export default class DirectoryShare extends Vue {
  //todo: sort highest permission to lowest permission
  private readonly permissionTypes: ActionNode[] = [
    { label: 'Editor', type: ActionType.edit, actions: editActions },
    { label: 'Viewer', type: ActionType.view, actions: [ActionType.view] },
    { label: 'Remove', type: ActionType.none, actions: [] }
  ];

  get swmStatusData(): ActionNode[] {
    //todo: sort highest permission to lowest permission
    return [
      {
        label: 'Editor',
        type: ActionType.edit,
        actions: editActions
      },
      {
        label: 'Viewer',
        type: ActionType.view,
        actions: [ActionType.view]
      },
      {
        label: 'Remove',
        type: ActionType.none,
        actions: []
      }
    ];
  }

  private currentPermission: ActionType = ActionType.none;

  items: any[];
  fields: any[];
  title: string;
  selected: any;
  isExpanded = false;
  link = '';
  searchInput = '';
  isShowPopover = false;
  resourceType: ResourceType = ResourceType.dashboard;
  resourceId = 98;
  getSharedUserStatus: Status = Status.Loading;
  getSharedUserError = '';

  getSuggestUserStatus: Status = Status.Loaded;
  suggestUserError = '';

  permissionTokenResponse: PermissionTokenResponse | null = null;
  copyStatus: CopyStatus = CopyStatus.Failed;
  static readonly SHOWING_DURATION = 1000;

  @Ref()
  mdShare!: BModal;

  get suggestedUsers() {
    return ShareModule.suggestedUsers;
  }

  get usersSharing(): UserSharingInfo[] | null {
    return ShareModule.usersSharing;
  }

  get sharedUsersResponse(): ResourceSharingInfo | null {
    return ShareModule.sharedUsersResponse;
  }

  get isGetSharedUserLoaded(): boolean {
    return this.getSharedUserStatus === Status.Loaded;
  }

  get isEdit() {
    return this.currentPermission === ActionType.edit;
  }

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

  show(resourceType: ResourceType, resourceId: number) {
    Log.debug('type::id', resourceType, resourceId);

    this.init(resourceType, resourceId);

    // this.handleCreateLinkShare(resourceType, resourceId);

    this.loadSharedUser(resourceType, resourceId);

    this.handleGetToken().then(() => {
      if (this.permissionTokenResponse) {
        this.createLinkShare(resourceType, resourceId);
      }
    });

    this.mdShare.show();
  }

  init(resourceType: ResourceType, resourceId: number) {
    this.isExpanded = false;
    this.resourceId = resourceId;
    this.resourceType = resourceType;
  }

  loadSharedUser(resourceType: ResourceType, resourceId: number) {
    this.getSharedUserStatus = Status.Loading;
    const request: GetUserSharingInfoRequest = new GetUserSharingInfoRequest(resourceType, resourceId, 0, 100);
    Log.debug('request::', request.resourceId, resourceId);
    ShareModule.getSharedUsers(request)
      .then(() => {
        Log.debug('DiShareModal::show::sharedUsersResponse::', this.sharedUsersResponse);
        this.getSharedUserStatus = Status.Loaded;
      })
      .catch(err => {
        this.getSharedUserStatus = Status.Error;
        this.getSharedUserError = err.message;
        Log.debug('DiShareModal::show::err::', err.message);
      });
  }

  private createLinkShare(type: ResourceType, resourceId: number) {
    if (this.permissionTokenResponse) {
      Log.debug('tokenResponse::', this.permissionTokenResponse);
      this.link = UrlUtils.createLinkShare(type, resourceId, this.permissionTokenResponse.tokenId);

      this.currentPermission = PermissionProviders.getHighestPermissionType(
        this.resourceType,
        this.resourceId,
        this.permissionTokenResponse.permissions ?? [],
        this.permissionTypes
      );
      Log.debug('handleCreateLinkShare::currentPermission', this.currentPermission);
    }
  }

  selectedRow(item: any, index: number, event: any) {
    Log.debug(item);
  }

  addNewFolder() {
    Log.debug('addNewFolder');
  }

  async done() {
    try {
      this.mdShare.hide();
      const isShareAnyoneActionChange = this.checkShareAnyoneChange();

      await ShareModule.saveAll({
        resourceId: this.resourceId,
        resourceType: this.resourceType,
        shareAnyonePermissionType: this.currentPermission,
        isChangeShareAnyone: isShareAnyoneActionChange
      });
    } catch (e) {
      PopupUtils.showError(e.message);
    }
  }

  handleClose() {
    Log.debug('DiShareModal::handleClose::Modal Closed.');
    this.searchInput = '';
    this.link = '';
    this.permissionTokenResponse = null;
    ShareModule.reset();
  }

  checkShareAnyoneChange(): boolean {
    if (this.permissionTokenResponse) {
      const highestPermission: ActionType = PermissionProviders.getHighestPermissionType(
        this.resourceType,
        this.resourceId,
        this.permissionTokenResponse.permissions ?? [],
        this.permissionTypes
      );
      return highestPermission !== this.currentPermission;
    }
    return false;
  }

  onRowSelected(item: any) {
    Log.debug(item);
    this.selected = item;
  }
  private onCopy(e: any) {
    Log.debug('You just copied: ' + e.text);
    this.showTooltip('copy-tooltip', CopyStatus.Success, DirectoryShare.SHOWING_DURATION);
  }
  private onError(e: any) {
    Log.debug('Failed to copy texts');
    this.showTooltip('copy-tooltip', CopyStatus.Failed, DirectoryShare.SHOWING_DURATION);
  }

  private toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  private get isCollapsed() {
    return !this.isExpanded;
  }

  private get getCursorClassForHeader() {
    // return 'cursor-default';handleGetSuggestedUsers

    if (this.isExpanded) {
      return 'cursor-pointer';
    } else {
      return 'cursor-default';
    }
  }

  private get getCursorClassForFooter() {
    if (this.isCollapsed) {
      return 'cursor-pointer';
    } else {
      return 'cursor-default';
    }
  }

  @Watch('searchInput')
  handleSearchInputChange(newValue: string) {
    if (newValue.trim() !== '') {
      this.isShowPopover = true;
      this.handleGetSuggestedUsers();
    } else {
      this.isShowPopover = false;
    }
  }

  private handleGetSuggestedUsers() {
    //todo: refactor fixed value
    this.getSuggestUserStatus = Status.Loading;
    ShareModule.getSuggestedUsers({ keyword: this.searchInput, from: 0, size: 100 })
      .then(() => {
        this.getSuggestUserStatus = Status.Loaded;
      })
      .catch(err => {
        this.getSuggestUserStatus = Status.Error;
        this.suggestUserError = err.message;
        Log.debug('DiShareModal::handleGetSuggestedUsers::err::', err);
      });
    Log.debug('DiShareModal::handleGetSuggestedUsers::suggestedUsers::', ShareModule.suggestedUsers);
  }

  private handleClickUserItem(userItemData: UserProfile) {
    Log.debug('DiShare::handleClickUserItem::data', userItemData);
    //todo: add new userItem to ShareStore
    ShareModule.addNewShareUser({ userProfile: userItemData, resourceId: this.resourceId, resourceType: this.resourceType });
  }

  private handleSharePermissionChange(userItemData: UserSharingInfo, permission: string) {
    Log.debug('change::', userItemData, permission);
    ShareModule.updateSharePermission({ userData: userItemData, editedValue: permission });
  }

  @Watch('isExpanded')
  handleOpenShareWithAnyOne(newValue: string) {
    if (newValue && !this.permissionTokenResponse) {
      this.handleCreateToken().then(() => this.createLinkShare(this.resourceType, this.resourceId));
    }
  }

  async handleCreateToken() {
    try {
      this.permissionTokenResponse = await ShareModule.shareWithAnyone({
        resourceType: this.resourceType,
        resourceId: this.resourceId,
        actions: [ActionType.view]
      });
    } catch (e) {
      PopupUtils.showError(e.message);
    }
  }

  async handleGetToken() {
    this.permissionTokenResponse = await ShareModule.getShareWithAnyone({
      resourceType: this.resourceType,
      resourceId: this.resourceId
    });
  }

  copyLink() {
    this.$copyText(this.link, this.$refs.container)
      .then(() => {
        //success copy link
        Log.debug('copied link:: ', this.link);
        this.showTooltip('quick-copy-tooltip', CopyStatus.Success, DirectoryShare.SHOWING_DURATION);
      })
      .catch(err => {
        //copy failed
        Log.debug('Copied Failed::error::', err);
        this.showTooltip('quick-copy-tooltip', CopyStatus.Failed, DirectoryShare.SHOWING_DURATION);
      });
  }
  //show tooltip during showing duration time
  showTooltip(tooltipId: string, status: CopyStatus, showingDuration: number) {
    try {
      this.displayTooltipWithId(tooltipId);
      this.copyStatus = status;
      this.waitToHideTooltip(tooltipId, showingDuration);
    } catch (e) {
      Log.debug('DiShareModel::ShowTooltip::Err::', e.message);
    }
  }

  displayTooltipWithId(tooltipId: string) {
    this.$root.$emit('bv::show::tooltip', tooltipId);
  }

  private waitToHideTooltip(tooltipId: string, showingDuration: number) {
    return setTimeout(() => {
      this.$root.$emit('bv::hide::tooltip', tooltipId);
    }, showingDuration);
  }

  handleCopyLinkShare() {
    if (this.permissionTokenResponse) {
      this.copyLink();
    } else {
      this.handleCreateToken().then(() => {
        this.createLinkShare(this.resourceType, this.resourceId);
        this.copyLink();
      });
    }
  }

  get tooltipBackground() {
    return { 'tooltip-basic-bg': this.copyStatus === CopyStatus.Failed, 'tooltip-success-bg': this.copyStatus === CopyStatus.Success };
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';
@import '~@/themes/scss/di-variables';

.icon-setting {
  padding: 8px;
  width: 28px;
  height: 28px;
}

.text-12px-opacity {
  @include regular-text;
  opacity: 0.5;
  font-size: 12px !important;
  color: $primaryTextColor;
  cursor: inherit;
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
  cursor: inherit;
}

.text-white {
  @include regular-text;
  letter-spacing: 0.18px;
  text-align: center;
  color: $primaryTextColor;
}

::v-deep {
  .modal-content {
    background-color: transparent !important;
  }

  .modal-header,
  .modal-content,
  .modal-body {
    background-color: var(--primary);
  }

  .modal-footer {
    margin-top: 16px;
    background-color: var(--primary);
    padding: 0;
  }

  img.ic-16 {
    margin-right: 0;
  }

  .modal-body {
    padding: 0 15px;
  }

  .modal-header {
    padding: 0 !important;
  }
}

.divider-top {
  margin: 15px -15px !important;
  background-color: #000 !important;
  height: 0.5px;
  opacity: 0.3;
}

.divider-bottom {
  margin: 15px -32px !important;
  background-color: #000 !important;
  height: 0.5px;
  opacity: 0.3 !important;
  border: unset;
}

.flex-auto {
  flex: auto;
}

.width-fit {
  min-width: 330px;
  background-color: var(--secondary);
}

.circle {
  position: relative;
  background-color: var(--blue-grey) !important;
  opacity: 0.2;
  height: 40px;
  width: 40px;
  border-radius: 50%;
  display: inline-block;
}

.icon-img {
  color: var(--neutral) !important;
  background-color: var(--backdrop) !important;
  position: absolute;
  transform: translate(72%, 72%);
}

.fade-enter {
  transform: translateY(100%);
}

.fade-enter-to {
  transform: translateY(0);
}

.linear-enter-active {
  position: absolute;
}

.fade-leave {
  transform: translateY(0);
}

.fade-leave-to {
  transform: translateY(5%);
}

.linear-enter-active,
.linear-leave-active {
  transition: all 750ms ease-in-out;
}

.input-link {
  color: rgba(#ffffff, 0.5);
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
}

.copy-reset {
  background-color: var(--secondary) !important;
  text-align: center;
  justify-content: center;
  justify-self: center;
}

::v-deep {
  .arrow {
    display: none;
  }

  .tooltip-inner {
    padding: 0 !important;

    .custom-tooltip-body {
      padding: 4px 12px;
      color: var(--white);
      letter-spacing: 0.18px;
      font-size: 14px;
      border-radius: 4px;
      letter-spacing: 0.18px;
      text-align: center;
    }
  }
}

.tooltip-success-bg {
  background-color: #009c31;
}

.tooltip-basic-bg {
  background-color: #000;
}
</style>
