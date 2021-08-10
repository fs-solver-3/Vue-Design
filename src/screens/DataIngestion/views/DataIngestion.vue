<template>
  <div>
    <HeaderBar></HeaderBar>
    <div class="data-ingestion-container">
      <DataIngestionHeader></DataIngestionHeader>
      <div class="d-flex data-management-body">
        <div class="left-panel">
          <div class="d-flex flex-column text-left">
            <router-link v-slot="{ href, navigate, isActive, isExactActive }" to="/data-ingestion">
              <a :href="href" :id="genBtnId('data-sources')" class="item-listing btn-ghost" :class="{ active: isExactActive }" @click="navigate">
                <img v-if="isExactActive" src="@/assets/icon/data_ingestion/ic_data_source_active.svg" />
                <img v-else src="@/assets/icon/data_ingestion/ic_data_source.svg" />
                <div>Data Sources</div>
              </a>
            </router-link>
            <router-link v-slot="{ href, navigate, isActive }" to="/data-ingestion/job">
              <a :href="href" :id="genBtnId('job')" class="item-listing btn-ghost" :class="{ active: isActive }" @click="navigate">
                <img v-if="isActive" src="@/assets/icon/data_ingestion/ic_job_active.svg" />
                <img v-else src="@/assets/icon/data_ingestion/ic_job.svg" />
                <div>Job</div>
              </a>
            </router-link>
            <router-link v-slot="{ href, navigate, isActive }" to="/data-ingestion/job-history">
              <a :href="href" :id="genBtnId('job-history')" class="item-listing btn-ghost" :class="{ active: isActive }" @click="navigate">
                <img v-if="isActive" src="@/assets/icon/data_ingestion/ic_job_history_active.svg" />
                <img v-else src="@/assets/icon/data_ingestion/ic_job_history.svg" />
                <div>Job History</div>
              </a>
            </router-link>
          </div>
        </div>
        <div class="right-panel d-flex flex-column">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import HeaderBar from '@/shared/components/HeaderBar.vue';
import DataIngestionHeader from '@/screens/DataIngestion/components/DataIngestionHeader.vue';
import { LoggedInScreen } from '@/shared/components/VueHook/LoggedInScreen';

@Component({
  components: {
    DataIngestionHeader,
    HeaderBar
  }
})
export default class DataIngestion extends LoggedInScreen {}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';

.data-ingestion-container {
  margin: 32px 32px 15px 32px;
}

.data-management-body {
  margin-top: 24px;
  height: calc(100vh - 150px);
}

.left-panel {
  background-color: var(--charcoal-2) !important;
  border-radius: 4px;
  margin-right: 16px;
  padding: 16px;
  width: 23%;
  height: 100%;

  .item-listing {
    padding: 16px;
    height: fit-content;
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;

    div {
      overflow: auto;
      width: max-content;
      text-overflow: ellipsis;
      white-space: nowrap;
      letter-spacing: 0.27px;
    }

    img {
      width: 24px !important;
      height: 24px !important;
      margin-right: 12px !important;
    }
  }
}

.right-panel {
  background-color: var(--charcoal-2);
  width: calc(77% - 16px);
  height: 100%;
  padding: 24px;
}

.active {
  img,
  svg {
    filter: none;
  }
  color: var(--accent) !important;
  &:hover {
    background: var(--secondary) !important;
  }
}
</style>
