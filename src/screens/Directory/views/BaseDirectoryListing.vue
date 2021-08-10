<template>
  <div class="d-flex flex-column">
    <transition mode="out-in" name="component-fade">
      <HeaderBar :container="'container'" />
    </transition>
    <div class="mar-b-32" />
    <div class="container">
      <div class="header-container no-gutters border-bottom-primary">
        <div class="category-container">
          <slot></slot>
        </div>
        <div class="breadcrumb-container">
          <ul v-if="getBreadcrumbs.length > 0" class="breadcrumb">
            <li v-for="(item, index) in getBreadcrumbs" :key="index" class="breadcrumb-item">
              <a v-if="item.disabled" class="max-width-to-hidden-text" disabled href="javascript:void(0);">{{ item.text }}</a>
              <router-link
                v-else
                :id="genBtnId('breadcrumb', index)"
                v-b-tooltip.hover
                :class="getBreadcrumbsActiveClass(getBreadcrumbs.length, index)"
                :title="item.text"
                :to="item.to"
                class="max-width-to-hidden-text"
                >{{ item.text }}
              </router-link>
            </li>
          </ul>
        </div>
        <div class="new-button-container">
          <b-button
            :class="{ disabled: currentErrorMessage }"
            :id="genBtnId('new')"
            class="md-float-auto create-new-directory h-44px btn-ghost"
            variant="secondary"
            v-on:click="btnAddNewClicked()"
          >
            <!--            <b-icon-plus class="icon-title" />-->
            <img class="mr-1" width="10" height="10" src="@/assets/icon/ic_add.svg" alt="" />
            New
          </b-button>
        </div>
      </div>
      <div class="row no-gutters mar-b-32">
        <div class="col-12 table-background vld-parent">
          <div v-if="!isLoading && currentErrorMessage" class="w-100 h-100 d-flex flex-row  align-items-center justify-content-center text-nowrap">
            <div class="error text-wrap">{{ currentErrorMessage }}</div>
            <div class="btn btn-link btn-ghost-alter" :id="genBtnId('retry')" @click.prevent="handleRetry">Try again</div>
          </div>
          <b-table
            v-else
            ref="tblDirectoryListing"
            :fields="fields"
            :items="getDirectories"
            borderless
            fixed
            hover
            responsive
            select-mode="single"
            selectable
            show-empty
            sort-icon-left
            table-variant="dark"
            @row-contextmenu="showContextMenu"
            @sort-changed="sortingChanged"
            @row-clicked="handleNavigateToChildrenFolder"
          >
            <template v-slot:cell(name)="row">
              <b-icon-folder-fill v-if="!isDashboard(row.item)"></b-icon-folder-fill>
              <b-icon-grid1x2-fill v-if="isDashboard(row.item)"></b-icon-grid1x2-fill>
              <span class="ml-2">{{ row.item.name }}</span>
            </template>
            <template v-slot:cell(menu)="row">
              <div :id="genBtnId(`directory-config`, row.index)" class="d-inline p-2 btn-ghost" @click.stop="showRowOptions(row)">
                <b-icon-three-dots-vertical role="button"></b-icon-three-dots-vertical>
              </div>
            </template>
          </b-table>
        </div>
      </div>
    </div>
    <ContextMenu ref="diContextMenu" :ignoreOutsideClass="listIgnoreClassForContextMenu" minWidth="250px" textColor="#fff" />
    <DirectoryCreate ref="mdCreateDirectory" />
    <DirectoryRename ref="mdRenameDirectory" />
    <DirectoryMove ref="mdMoveDirectory" />
    <!--    <DirectoryShare ref="mdShareDirectory" />-->
    <DiShareModal ref="mdShareDirectory" />
  </div>
</template>

<script lang="ts" src="./BaseDirectoryListing.ts" />

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';

.select-container > .relative > span > button > span {
  padding-right: 7px !important;
}

// large screen
@media all and (min-width: 768px) {
  .max-width-to-hidden-text {
    max-width: 100px;
  }

  .breadcrumb-container {
    flex-grow: 2;
  }

  .category-container {
    width: 185px !important;
  }

  .new-button-container {
    width: 120px;
  }

  ::v-deep {
    .btn-secondary:hover,
    .btn-ghost:hover {
      width: 120px !important;
    }
  }

  .root-directory-container {
    width: 185px !important;
  }

  .root-directory-background {
    width: 185px !important;
  }
}

// medium screen
@media all and (max-width: 767px) {
  .max-width-to-hidden-text {
    max-width: 60px;
  }

  .breadcrumb-container {
    flex-grow: 1;
  }

  .category-container {
    width: 120px !important;
  }

  .root-directory-container {
    width: 120px !important;
  }

  .root-directory-background {
    width: 120px !important;
  }

  .new-button-container {
    width: 80px;
  }

  ::v-deep {
    .btn-secondary:hover,
    .btn-ghost:hover {
      width: 80px !important;
    }
  }
}

// small screen
@media all and (max-width: 527px) {
  .max-width-to-hidden-text {
    max-width: 40px;
  }

  .breadcrumb-container {
    flex-grow: 1;
  }

  .new-button-container {
    width: 65px;
  }

  ::v-deep {
    .btn-secondary:hover,
    .btn-ghost:hover {
      width: 65px !important;
    }
  }
}

// super small screen
@media all and (max-width: 452px) {
  .header-container {
    justify-content: flex-end;
  }

  .max-width-to-hidden-text {
    max-width: 35px !important;
  }
}

// super super small screen
@media all and (max-width: 372px) {
  .header-container {
    justify-content: flex-start;
  }

  .new-button-container {
    margin-left: auto;
  }
}

.header-container {
  display: flex;
  flex-flow: row wrap;
  width: 100%;
}

.category-container {
  order: 0;
}

.breadcrumb-container {
  order: 1;
}

.new-button-container {
  order: 2;
}

::v-deep {
  td::after {
    @include custom-td-after;
    width: 100% !important;
  }

  td:last-child::after {
    right: 10px;
  }

  .btn-secondary:hover,
  .btn-ghost:hover {
    border: none !important;
    border-radius: 0px !important;
  }
}

ul {
  margin-bottom: 0 !important;
  margin-top: 0 !important;
}

.breadcrumb {
  background-color: var(--primary) !important;
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin-left: 0px !important;
  max-height: 44px !important;
  padding: 15px !important;
}

.breadcrumb-item > a {
  font-size: 14px !important;
  line-height: none;
  max-height: 17px;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  @include regular-text;
}

.active {
  color: var(--accent) !important;
  font-weight: bold !important;
}

.breadcrumb-item + .breadcrumb-item::before {
  color: var(--neutral);
  content: '>';
  line-height: 1rem;
}

.icon-title {
  height: 18px;
  margin-right: 2px;
  width: 18px;
}

.create-new-directory {
  @include regular-text;
  font-size: 14px !important;
  opacity: 0.7;

  &.disabled {
    opacity: 0.4 !important;
  }
  &:hover {
    opacity: 1;
  }
}

.border-bottom-primary {
  border-bottom: 1px solid var(--primary);
}

.btn {
  padding: 0px 10px 0px 0px !important;
  transition: none !important;
}

.btn:focus {
  box-shadow: none !important;
}

a:hover,
a:visited,
a:link,
a:active {
  text-decoration: none !important;
}

a:visited {
  outline: 0 !important;
}

.disabled {
  opacity: 0.6 !important;
  pointer-events: none !important;
}

.table-background {
  background-color: var(--secondary);
  min-height: calc(90vh - 60px);
}

.root-directory-container {
  background-color: var(--secondary) !important;
  height: 44px;
}

.root-directory-background {
  @include regular-text;
  background-color: var(--secondary);
  border-radius: 4px 4px 0px 0px;
  cursor: pointer;
  font-size: 14px;
}

.router-link-exact-active {
  border-bottom: none !important;
  margin-bottom: 0;
  padding-bottom: 0px !important;
}
</style>

<style>
body {
  /*height: 110vh;*/
}
</style>
