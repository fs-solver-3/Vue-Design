<template>
  <div :style="settingStyle" class="setting-panel">
    <div class="tab-setting-listing">
      <DiTab :disableKeys="disableKeys" :prefixKey="chartType" :tabs="tabItemsSynced" keyForDisplay="name" tabKey="key">
        <template #default="{ tab }">
          <template v-if="isTabCode(tab)">
            <CustomCodePanel
              :css.sync="cssSynced"
              :html.sync="htmlSynced"
              :js.sync="jsSynced"
              :optionSelected.sync="optionSelected"
              :title="title"
              @onRun="handleRun"
              prefixId="full-screen"
            >
              <template #zoom-icon>
                <div class="custom-icon-zoom btn-ghost-alter" @click="showCustomCode">
                  <img alt="maximize" src="@/assets/icon/maximize.svg" />
                </div>
              </template>
            </CustomCodePanel>
          </template>
          <vuescroll v-else>
            <div class="setting-scroll-area h-100">
              <template v-for="(settingItem, index) in tab.settingItems">
                <div v-if="isNoneComponent(settingItem.type)" :key="index" class="col-6 mar-b-16"></div>
                <GroupSettingComponent v-else-if="isGroupSettingComponent(settingItem.type)" :key="index" :settingItem.sync="settingItem">
                </GroupSettingComponent>
                <component :is="settingItem.type" v-else-if="settingItem.type" :key="index" :settingItem.sync="settingItem" class="col-6 mar-b-16"></component>
              </template>
            </div>
          </vuescroll>
        </template>
      </DiTab>
    </div>
    <CustomCodeModal
      ref="customCodeModal"
      :css.sync="cssSynced"
      :html.sync="htmlSynced"
      :js.sync="jsSynced"
      :optionSelected.sync="optionSelected"
      :title="title"
      @onRun="handleRun"
    />
  </div>
</template>
<script lang="ts" src="./SettingPanel.ts"></script>

<style lang="scss" scoped>
.setting-panel {
  padding-top: 16px;

  .tab-setting-listing {
    height: 100%;

    .setting-scroll-area {
      display: inline-flex;
      flex-wrap: wrap;
      height: 100%;
      width: 100%;
      margin-bottom: 50px;
    }
  }
}

::v-deep {
  .ant-tabs-content {
    height: 100% !important;
  }
}

.custom-icon-zoom {
  box-sizing: content-box;
  float: right;
  height: 20px;
  margin-right: 8px;
  margin-top: -130px;
  padding: 4px;
  position: relative;
  width: 20px;
}
</style>
