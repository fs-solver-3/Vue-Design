<template>
  <div v-if="userData" class="user-item d-flex justify-content-between" @click="handleClickUserItem">
    <div class="d-flex flex-row mt-3 align-items-center">
      <div>
        <img class="icon-title rounded-circle" width="40" height="40" :src="userData.avatar || defaultAvatar" @error="$event.target.src = defaultAvatar" alt />
      </div>
      <div class="d-flex flex-column ml-2">
        <label v-if="userData.fullName" class="text-14px-opacity">
          {{ userData.fullName }}
          <span v-if="isShowUserStatus">
            - <span class="user-status">{{ userStatus }}</span></span
          >
        </label>
        <label v-else class="text-14px-opacity">
          {{ userData.firstName }} {{ userData.lastName }}
          <span v-if="isShowUserStatus">
            - <span class="user-status">{{ userStatus }}</span></span
          >
        </label>
        <label class="text-12px">{{ userData.email }}</label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { UserProfile } from '@core/domain/Model';
@Component
export default class UserItem extends Vue {
  defaultAvatar = require('@/assets/icon/default-avatar.svg');

  @Prop({ default: '', type: String })
  userStatus!: string;

  @Prop({ required: true })
  userData!: UserProfile;

  private get isShowUserStatus(): boolean {
    return this.userStatus !== '';
  }

  private handleClickUserItem() {
    this.$emit('handleClickUserItem', this.userData);
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';
@import '~@/themes/scss/di-variables';
.text-14px-opacity {
  @include regular-text;
  opacity: 0.8;
  font-size: 14px !important;
  letter-spacing: 0.6px;
  color: $primaryTextColor;
}
.text-12px {
  @include regular-text;
  letter-spacing: 0.51px !important;
  font-size: 12px !important;
  color: $primaryTextColor;
}

.user-item {
  padding: 0 20px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: var(--secondary);
  }
}
</style>
