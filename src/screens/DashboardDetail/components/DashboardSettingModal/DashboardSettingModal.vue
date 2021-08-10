<template>
  <div v-if="canShowModal">
    <DiCustomModal
      id="dashboard-setting"
      ref="modal"
      size="md"
      cancel-title="Cancel"
      ok-title="Apply"
      title="Setting Dashboard"
      @onCancel="cancelSetting"
      @onClickOk="applySetting"
    >
      <template #default>
        <div class="dashboard-setting">
          <div class="reset-panel">
            <div class="header">
              <h5>Select theme</h5>
              <div @click="selectTheme(DashboardThemeType.default)">Reset to default</div>
            </div>
            <div class="theme-selection">
              <template v-for="theme in themes">
                <div :title="theme.label" :key="theme.type" :class="{ active: theme.type === currentTheme }" @click="selectTheme(theme.type)">
                  <img :alt="theme.type" :src="require(`@/assets/icon/dashboard/theme/${theme.type}.png`)" />
                  <div>{{ theme.label }}</div>
                </div>
              </template>
            </div>
          </div>
          <ToggleSettingComponent :settingItem="overlapSettingItem" class="overlap" @onChanged="onOverlapSettingChanged" />
        </div>
      </template>
    </DiCustomModal>
  </div>
</template>

<script lang="ts" src="./DashboardSettingModal.ts" />

<style lang="scss">
@import '~@/themes/scss/di-variables.scss';

#dashboard-setting {
  .modal-title {
    font-size: 24px;
    line-height: 1.17;
    letter-spacing: 0.2px;
    font-weight: bold;
  }

  .modal-body {
    padding: 24px;
  }

  .modal-footer {
    justify-content: center;
    button {
      max-width: 192px;
    }

    button + button {
      margin-left: 16px;
    }
  }

  .dashboard-setting {
    > .reset-panel {
      margin-bottom: 24px;
      > .header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;

        > h5 {
          font-size: 16px;
          letter-spacing: 0.13px;
          line-height: 1.75;
          cursor: default;
        }

        > div {
          color: $accentColor;
          cursor: pointer;
        }
      }

      > .theme-selection {
        cursor: pointer;

        display: flex;
        justify-content: space-between;
        overflow: hidden;

        padding: 2px;

        > .active {
          img {
            border: solid 2px $accentColor;
          }

          h6 {
            color: $accentColor;
          }
        }

        > div {
          > img {
            height: 86px;
            margin-bottom: 6px;
            width: 80px;
          }

          > div {
            white-space: nowrap;
            overflow: hidden;
            width: 80px;
            text-overflow: ellipsis;
            color: white;
            font-size: 14px;
            opacity: 0.6;
          }
        }
      }
    }

    > .overlap {
      justify-content: space-between;
      padding: 0;

      p.label {
        opacity: initial;
      }

      [class*='col-'] {
        flex: unset;
        max-width: unset;
        width: unset;
        padding: 0;
      }
    }
  }
}
</style>
