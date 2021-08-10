<template>
  <div class="d-flex justify-content-between align-items-center">
    <div class="d-flex title">
      <div class="regular-icon-16">
        <img alt="database" height="24" style="opacity: 0.4" src="@/assets/icon/data_ingestion/ic_data_ingestion.svg" width="24" />
      </div>
      <span align="center" class="regular-text-24">Data Ingestion</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import DatabaseCreationModal from '@/screens/DataManagement/components/DatabaseCreationModal.vue';

@Component({
  components: { DatabaseCreationModal }
})
export default class DataIngestionHeader extends Vue {}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';

.title {
  align-items: center;
  height: 37px;
}
</style>
