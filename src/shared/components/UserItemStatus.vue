<template>
  <div v-if="userData" class="user-status-item d-flex justify-content-between align-items-center">
    <UserItem :user-data="userData.user" :user-status="userStatus" class="user-item"></UserItem>
    <DiDropdown :id="genDropdownId('status', id)" v-model="currentValue" :appendAtRoot="true" :data="swmData" value-props="type"></DiDropdown>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import UserItem from '@/shared/components/UserItem.vue';
import { ActionType, ResourceType } from '@/utils/permission_utils';
import { ActionNode } from '@/shared';
import { PermissionProviders } from '@core/admin/domain/permissions/PermissionProviders';
import { UserSharingInfo } from '@core/domain/Response/ResouceSharing/UserSharingInfo';
import { Log } from '@core/utils';

@Component({
  components: { UserItem }
})
export default class UserItemStatus extends Vue {
  @Prop({ required: true })
  userData!: UserSharingInfo;

  @Prop({ required: true })
  resourceType!: ResourceType;

  @Prop({ required: true })
  resourceId!: number;

  @Prop({ required: true, type: Number })
  private readonly id!: number;

  currentValue!: string;
  @Prop()
  swmData!: ActionNode[];

  constructor() {
    super();
    this.currentValue = this.permission;
  }

  //todo: get
  get permission() {
    // return this.userData.permissions[0];
    Log.debug(
      'userStatusDAta::',
      this.userData.user.email,
      PermissionProviders.getHighestPermissionType(this.resourceType, this.resourceId, this.userData.permissions, this.swmData)
    );
    return PermissionProviders.getHighestPermissionType(this.resourceType, this.resourceId, this.userData.permissions, this.swmData);
  }

  get isPendingRemove() {
    //todo change remove value
    return this.currentValue === ActionType.none;
  }

  get userStatus(): string {
    if (this.isPendingRemove) {
      return 'Spending removal';
    }
    return '';
  }

  @Watch('currentValue')
  handleStatusChange(newValue: string) {
    this.$emit('handleStatusChange', this.userData, newValue);
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';
@import '~@/themes/scss/di-variables';

.text-14px-opacity {
  @include regular-text;
  color: $primaryTextColor;
  font-size: 14px !important;
  letter-spacing: 0.6px;
  opacity: 0.8;
}

.text-12px {
  @include regular-text;
  color: $primaryTextColor;
  font-size: 12px !important;
  letter-spacing: 0.51px !important;
}

.user-item {
  pointer-events: none;

  ::v-deep {
    padding: 0;

    .user-status {
      color: var(--accent);
    }
  }
}
</style>
