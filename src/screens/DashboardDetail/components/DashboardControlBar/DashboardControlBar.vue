<template>
  <VueBlocListener :bloc="settingBloc" @onStateChange="handleOnStateChanged">
    <div class="row no-gutters d-flex justify-content-end">
      <div v-if="dashboardId">
        <MainDateFilter
          v-if="isShowMainDateFilter"
          :class="getHiddenClass"
          :defaultDateRange="defaultDateRange"
          :isShowResetFilterButton="isShowResetFilter"
          :mainDateFilterMode="mainDateFilterMode"
        />
        <SetupMainDateFilter
          v-else
          :class="getHiddenClass"
          :isResetMainDateFilter="isResetMainDateFilter"
          @handle-setup-main-date-filter="handleSetupMainDateFilter"
          @handle-clear-reset-main-date="handleClearResetMainDate"
        />
      </div>
      <div v-if="dashboardId" class="d-flex">
        <DiButton v-if="showResetFilters" :id="genBtnId('reset-filter')" class="col-auto pl-8" title="Reset Filters" @click="resetFilter">
          <img alt="Reset filter" class="icon-title unselectable" src="@/assets/icon/ic_reset.svg" />
        </DiButton>
        <SelectFieldButton id="add-filter" :dashboardId="dashboardId" icon-image="ic-16-filter.svg" title="Add Filter"></SelectFieldButton>
      </div>
      <transition mode="out-in" name="fade">
        <!--      View Mode-->
        <div v-if="isViewMode" key="view" class="row no-gutters controls justify-content-end">
          <DiButton :id="genBtnId('fullscreen')" :title="'Full screen'" class="col-auto pl-8" @click="switchMode('to_full_screen')">
            <img alt="Fullscreen" class="icon-title" src="@/assets/icon/ic_fullscreen.svg" />
          </DiButton>
          <DiButton :id="genBtnId('tv-mode')" :title="'TV mode'" @click="switchMode('to_tv_mode')">
            <b-icon-display class="icon-title opacity-0dot5" />
          </DiButton>
          <PermissionWidget :actionTypes="actionTypes" :allowed-actions="['*']">
            <DiButton :id="genBtnId('share')" class="col-auto pl-8" title="Share" @click="clickShare">
              <img alt="share" class="icon-title" src="@/assets/icon/ic_share.svg" />
            </DiButton>
          </PermissionWidget>
          <PermissionWidget :actionTypes="actionTypes" :allowed-actions="['*', 'edit']">
            <DiButton :id="genBtnId('edit-mode')" class="col-auto pl-8" title="Edit" @click="switchMode('to_edit')">
              <img alt class="icon-title" src="@/assets/icon/ic_edit_white.svg" />
            </DiButton>
          </PermissionWidget>
        </div>
        <!--      FullScreen-->
        <div
          v-else-if="isFullScreen || isTVMode"
          :id="genBtnId('exit-fullscreen')"
          key="full-screen"
          class="ic-16 ic-exit-fullscreen"
          @click="switchMode('to_view')"
        >
          <img alt="full-screen" class="icon-title" src="@/assets/icon/ic_exit_fullscreen.svg" />
        </div>
        <!--      Edit Mode-->
        <div v-else key="edit" class="row no-gutters controls justify-content-end">
          <PermissionWidget :actionTypes="actionTypes" :allowed-actions="['*', 'create']">
            <DiButton :id="genBtnId('adding-chart')" class="col-auto pl-8 di-popup" title="Adding" @click.prevent="clickAdding">
              <img alt="Adding" class="icon-title di-popup" src="@/assets/icon/ic_add_white.svg" />
            </DiButton>
          </PermissionWidget>
          <DiButton :id="genBtnId('setting-dashboard')" class="col-auto pl-8" title="Settings" @click="showDashboardSetting">
            <img alt="Settings" class="icon-title" src="@/assets/icon/ic_setting_white.svg" />
          </DiButton>
          <DiButton :id="genBtnId('save')" class="col-auto pl-8" title="Save" @click="switchMode('to_view')">
            <img alt="Save" class="icon-title" src="@/assets/icon/ic_save_white.svg" />
          </DiButton>
        </div>
      </transition>
      <template>
        <input
          :id="genInputId('image-picker')"
          ref="imagePicker"
          accept="image/*"
          class="form-control-file"
          style="display: none !important;"
          type="file"
          @change="handleFileSelected"
        />
        <DashboardSettingModal ref="dashboardSettingModal" />
      </template>
    </div>
  </VueBlocListener>
</template>

<script lang="ts" src="./DashboardControlBar.ts" />

<style lang="scss" scoped src="./dashboard-control-bar.scss"></style>
