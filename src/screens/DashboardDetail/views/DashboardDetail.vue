<template>
  <div class="dashboard-theme d-flex flex-column full-height w-100">
    <template v-if="!(isFullScreen || isTVMode)">
      <transition mode="out-in" name="header-fade">
        <HeaderBar :showLogout="isLogin" />
      </transition>
    </template>
    <transition name="component-fade">
      <div :class="dashboardPaddingClass" class="dashboard-area">
        <header ref="actionBar" class="header-sticky">
          <DashboardHeader ref="dashboardHeader" :enableFilter="hasWidget" :isLogin="isLogin" />
        </header>
        <StatusWidget :class="statusClass" :error="errorMessage" :status="dashboardStatus" class="dashboard-status" @retry="loadDashboard">
          <template #loading>
            <div class="d-flex flex-row align-items-center justify-content-center status-loading">
              <DiLoading></DiLoading>
            </div>
          </template>
          <template #error="{ error , onRetry}">
            <div class="error-panel">
              <ErrorWidget :error="error" @onRetry="onRetry"></ErrorWidget>
            </div>
          </template>
          <template #default>
            <Dashboard v-if="hasWidget" :style="dashboardStyle" />
            <EmptyDashboard v-else class="empty-dashboard" />
          </template>
        </StatusWidget>
      </div>
    </transition>
    <template>
      <ContextMenu ref="contextMenu" :ignoreOutsideClass="['di-popup']" minWidth="250px" textColor="#fff" />
      <EditTextModal ref="editTextModal" @onCreateText="handleCreateText" @onEditText="handleEditText" />
      <DiShareModal ref="shareModal" />
      <WidgetFullScreenModal ref="widgetFullScreenModal"></WidgetFullScreenModal>
    </template>
  </div>
</template>

<script lang="ts" src="./DashboardDetail.ts" />

<style lang="scss" src="./dashboard-detail.scss"></style>
<style lang="scss" src="./dashboard-theme.scss"></style>
<style lang="scss" src="./dashboard-popover-theme.scss"></style>
<style lang="css">
body {
  height: 100vh !important;
}

#app {
  height: 100%;
}

.disable {
  pointer-events: none;
}
</style>
