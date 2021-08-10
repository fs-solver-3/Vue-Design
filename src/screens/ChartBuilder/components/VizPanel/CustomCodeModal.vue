<template>
  <BModal :id="id" ref="modal" body-class="custom-body" centered class="rounded" hide-footer hide-header size="xl">
    <template #default="{ok}">
      <CustomCodePanel
        :title="title"
        :css.sync="cssSynced"
        :html.sync="htmlSynced"
        :optionSelected.sync="optionSelectedSynced"
        :js.sync="jsSynced"
        @onRun="handleRun"
      >
        <template #zoom-icon>
          <div class="custom-icon-zoom btn-ghost-alter" @click="ok">
            <img alt="maximize" src="@/assets/icon/minimize.svg" />
          </div>
        </template>
      </CustomCodePanel>
    </template>
  </BModal>
</template>

<script lang="ts">
import { Component, Emit, Prop, PropSync, Ref, Vue } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';
import CustomCodePanel, { CustomLanguage } from '@/screens/ChartBuilder/components/VizPanel/CustomCodePanel.vue';
import { DefaultHtml } from '@/shared/constants/custom-chart.html';
import { DefaultCss } from '@/shared/constants/custom-chart.css';
import { DefaultJs } from '@/shared/constants/custom-chart.js';

@Component({
  components: { CustomCodePanel }
})
export default class CustomCodeModal extends Vue {
  private readonly id = 'custom-code-modal';

  @PropSync('html', { type: String, required: true, default: DefaultHtml })
  private htmlSynced!: string;

  @PropSync('css', { type: String, required: true, default: DefaultCss })
  private cssSynced!: string;

  @PropSync('js', { type: String, required: true, default: DefaultJs })
  private jsSynced!: string;

  @Prop({ required: true, type: String })
  private title!: string;

  @PropSync('optionSelected', { required: true, type: String })
  private optionSelectedSynced!: CustomLanguage;

  @Ref()
  private readonly modal!: BModal;

  show(): void {
    this.modal.show();
  }

  @Emit('onRun')
  private handleRun(event: MouseEvent) {
    this.modal.hide();
    return event;
  }
}
</script>

<style lang="scss" scoped>
::v-deep {
  .custom-body {
    height: 70vh;
    padding: 0;
  }
}

.custom-icon-zoom {
  float: right;
  margin-right: 16px;
  margin-top: -48px;
  padding: 8px;
  position: relative;

  img {
    box-sizing: border-box;
    height: 16px;
    width: 16px;
  }
}
</style>
