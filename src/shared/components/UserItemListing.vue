<template>
  <BPopover :target="target" :show.sync="syncedIsShowPopover" class="popover-custom" custom-class="popover-custom" placement="bottom" triggers="blur click">
    <div class="popover-body">
      <div style="height: 200px" v-if="isShowStatusWidget">
        <StatusWidget class="status-widget" :status="status" :error="error"></StatusWidget>
      </div>
      <vuescroll>
        <div v-if="isLoaded" class="vuescroll-body">
          <UserItem v-for="(item, index) in data" :key="index" :user-data="item" @handleClickUserItem="handleClickUserItem"></UserItem>
        </div>
      </vuescroll>
    </div>
  </BPopover>
</template>

<script lang="ts">
import { Component, Prop, PropSync, Vue } from 'vue-property-decorator';
import UserItem from '@/shared/components/UserItem.vue';
import { UserProfile } from '@core/domain/Model';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import { Status } from '@/shared';

@Component({
  components: { StatusWidget, UserItem }
})
export default class UserItemListing extends Vue {
  @Prop()
  data!: UserProfile[];

  @PropSync('isShowPopover')
  syncedIsShowPopover!: boolean;

  @Prop()
  target!: string;

  @Prop()
  status!: Status;

  @Prop()
  error!: string;

  private get isLoaded(): boolean {
    return this.status === Status.Loaded;
  }
  private get isShowStatusWidget(): boolean {
    return this.status === Status.Loading || this.status === Status.Error;
  }
  private handleClickUserItem(data: UserProfile) {
    this.$emit('handleClickUserItem', data);
    this.syncedIsShowPopover = false;
  }
}
</script>

<style lang="scss" scoped>
.popover-custom {
  background: none !important;
  max-width: unset;
  width: unset;
  border: none;
  width: 100%;
  top: -10px;
  padding: 0 3px;

  ::v-deep {
    .arrow {
      display: none;
    }
  }
  .popover-body {
    background: var(--primary) !important;
    width: 100%;
    border-radius: 4px;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.16), 0 4px 4px 0 rgba(0, 0, 0, 0.16);
    margin-top: -15.8px;
    padding: 0 !important;
  }
}

.vuescroll-body {
  max-height: calc(100vh - 64vh);
}

.status-widget {
}
</style>
