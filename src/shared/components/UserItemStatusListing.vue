<template>
  <div v-if="data">
    <vuescroll :ops="ops">
      <div class="vuescroll-body">
        <div v-if="owner">
          <UserItem class="owner" :user-data="owner" userStatus="Owner"></UserItem>
        </div>
        <UserItemStatus
          v-for="(item, index) in data"
          :id="index"
          :user-data="item"
          :key="index"
          :swm-data="statusData"
          :resourceType="resourceType"
          :resourceId="resourceId"
          @handleStatusChange="handleItemStatusChange"
        ></UserItemStatus>
      </div>
    </vuescroll>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import UserItemStatus from './UserItemStatus.vue';
import { ResourceType, ActionType, PermissionUtils } from '@/utils/permission_utils';
import { Config } from 'vuescroll';
import { UserProfile } from '@core/domain/Model';
import { ActionNode, LabelNode } from '@/shared';
import { UserSharingInfo } from '@core/domain/Response/ResouceSharing/UserSharingInfo';

@Component({
  components: { UserItemStatus }
})
export default class UserItemStatusListing extends Vue {
  ops: Config = {
    bar: {
      showDelay: 500,
      onlyShowBarOnScroll: true,
      keepShow: false,
      opacity: 1,
      // hoverStyle: false，
      specifyBorderRadius: false,
      minSize: 0,
      size: '4px',
      disable: false
    }
  };

  @Prop({ required: false })
  owner?: UserProfile;

  @Prop({ required: true })
  data!: UserSharingInfo[];

  @Prop({ required: true })
  resourceType!: ResourceType;

  @Prop({ required: true })
  resourceId!: number;

  @Prop()
  statusData!: ActionNode[];

  handleItemStatusChange(userItemData: UserSharingInfo, status: string) {
    this.$emit('handleItemStatusChange', userItemData, status);
  }
}
</script>

<style lang="scss" scoped>
.vuescroll-body {
  max-height: calc(100vh - 64vh);
  padding-right: 8px;
  .owner {
    padding: 0;
    pointer-events: none;

    ::v-deep {
      .user-status {
        font-weight: 600;
      }
    }
  }
}
</style>
