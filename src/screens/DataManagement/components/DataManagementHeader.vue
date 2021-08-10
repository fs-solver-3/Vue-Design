<template>
  <div class="d-flex justify-content-between align-items-center">
    <div class="d-flex ">
      <div class="regular-icon-16">
        <img alt="database" style="opacity: 0.4" src="@/assets/icon/data_management/ic_database.svg" />
      </div>
      <span align="center" class="regular-text-24">Data Management</span>
    </div>
    <div class="user-header-actions d-flex align-items-center">
      <router-link :to="dataSchemaRoute" class="user-header-actions--item">
        <i class="di-icon-schema mr-1"></i>
        Schema
      </router-link>
      <router-link :to="queryEditorRoute" class="user-header-actions--item">
        <i class="di-icon-query-editor mr-1"></i>
        Query Editor
      </router-link>
      <router-link :to="dataRelationshipRoute" class="user-header-actions--item">
        <i class="di-icon-relationship mr-1"></i>
        Relationship
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Routers } from '@/shared';

@Component
export default class DataManagementHeader extends Vue {
  private dataSchemaRoute = { name: Routers.dataSchema };
  private queryEditorRoute = { name: Routers.queryEditor };
  private dataRelationshipRoute = { name: Routers.dataRelationship };
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';
.user-header-actions {
  .user-header-actions--item {
    margin-left: 24px;
    color: #fff;
    opacity: var(--normal-opacity, 0.6);
    text-decoration: none;

    &:hover {
      opacity: 1;
    }

    &.router-link-active,
    &.router-link-exact-active {
      color: var(--accent);
      padding: 0 !important;
      opacity: 1;
    }
  }
}
button {
  @include regular-text-14();
  outline: none;
  background: none;
  border: none;
  border-radius: 4px;

  .text {
    opacity: 0.5;
  }
  &:hover {
    .text {
      opacity: 1;
    }
  }
}

.custom-popover {
  background: none;
  border: none;
  max-width: unset;
  top: -10px !important;
  left: 20px !important;
  padding: 0 !important;
  margin-top: 0 !important;

  ::v-deep {
    .arrow {
      display: none;
    }
  }

  .popover-body {
    background: var(--primary);
    padding: 6px 0;
    height: auto;
    width: fit-content;
    border-radius: 4px;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.16), 0 4px 4px 0 rgba(0, 0, 0, 0.16);

    .popover-item {
      display: flex;
      padding: 12px 16px;
      width: 100%;
      border-radius: 4px;
      cursor: pointer !important;

      @include regular-text-14();

      &:hover {
        background: var(--secondary);
      }
    }
  }
}
</style>
