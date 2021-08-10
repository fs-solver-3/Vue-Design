<template>
  <div v-b-hover="handleHover" class="overflow-hidden h-100">
    <template v-if="isText">
      <div :class="[paddingClass, scrollClass]" class="d-flex flex-row align-items-center h-100 w-100">
        <TextViewer :class="textClass" :widget="widget" />
        <template v-if="showEditComponent">
          <b-icon-three-dots-vertical v-show="isShowEdit" class="ml-auto btn-icon btn-ghost-alter di-popup ic-16 mr-1" @click.prevent="clickSeeMore">
          </b-icon-three-dots-vertical>
        </template>
      </div>
    </template>
    <template v-else>
      <transition name="fade">
        <template v-if="isShowEdit">
          <div class="d-block edit-header">
            <b-icon-three-dots-vertical class="btn-icon float-right btn-ghost-alter di-popup ic-16 image-icon" @click.prevent="clickSeeMore">
            </b-icon-three-dots-vertical>
          </div>
        </template>
      </transition>
      <div class="h-100 w-100">
        <ImageViewer v-if="this.isImage" :widget="this.widget" />
        <div v-else>Widget unsupported</div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { ContextMenuItem, DashboardOptions } from '@/shared';
import { TextWidget, Widget, Widgets } from '@core/domain/Model';
import ImageViewer from '@/screens/DashboardDetail/components/WidgetContainer/other/ImageViewer.vue';
import TextViewer from '@/screens/DashboardDetail/components/WidgetContainer/other/TextViewer.vue';
import { DashboardModalModule, DashboardModeModule, WidgetModule } from '@/screens/DashboardDetail/stores';

@Component({ components: { ImageViewer, TextViewer } })
export default class OtherWidget extends Vue {
  isHovered = false;
  @Prop({ type: Boolean, default: false })
  showEditComponent!: boolean;
  @Prop({ required: true })
  widget!: Widget;
  // Provide from DiGridstackItem
  @Inject()
  remove!: (fn: Function) => void;

  get isImage(): boolean {
    return this.widget.className === Widgets.Image;
  }

  get isText(): boolean {
    return this.widget.className === Widgets.Text;
  }

  get isShowEdit(): boolean {
    return this.showEditComponent && this.isHovered;
  }

  get textClass(): string {
    return this.showEditComponent ? 'disable' : '';
  }

  get scrollClass(): string {
    return this.showEditComponent ? '' : 'overflow-auto';
  }

  get paddingClass(): string {
    if (this.showEditComponent) {
      return 'pad-l-15';
    } else {
      return 'pad-x-15';
    }
  }

  private get normalWidgetActions(): ContextMenuItem[] {
    return [
      {
        text: DashboardOptions.DUPLICATE,
        click: this.duplicateWidget,
        disabled: !DashboardModeModule.canDuplicate
      },
      {
        text: DashboardOptions.DELETE,
        click: this.deleteWidget,
        disabled: !DashboardModeModule.canDelete
      }
    ];
  }

  private get textWidgetActions(): ContextMenuItem[] {
    return [
      {
        text: DashboardOptions.EDIT_TEXT,
        click: this.editText,
        disabled: !DashboardModeModule.canEdit
      },
      {
        text: DashboardOptions.DUPLICATE,
        click: this.duplicateWidget,
        disabled: !DashboardModeModule.canDuplicate
      },
      {
        text: DashboardOptions.DELETE,
        click: this.deleteWidget,
        disabled: !DashboardModeModule.canDelete
      }
    ];
  }

  handleHover(isHovered: boolean) {
    this.isHovered = isHovered;
  }

  clickSeeMore(event: Event) {
    const meuItems = this.isText ? this.textWidgetActions : this.normalWidgetActions;
    DashboardModalModule.showContextMenu({
      event: event,
      items: meuItems
    });
  }

  private duplicateWidget() {
    DashboardModalModule.hideContextMenu();
    WidgetModule.handleDuplicateWidget(this.widget);
  }

  private deleteWidget() {
    this.remove(() => {
      DashboardModalModule.hideContextMenu();
      WidgetModule.handleDeleteWidget(this.widget);
    });
  }

  private editText() {
    DashboardModalModule.hideContextMenu();
    DashboardModalModule.showEditTextModal({
      textWidget: this.widget as TextWidget,
      isEdit: true
    });
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/di-variables.scss';

.pad-l-15 {
  padding-left: 15px;
}

.edit-header {
  background-color: $secondaryColor;
  height: 48px;
  justify-content: center;
  opacity: 0.5;
  position: absolute;
  width: 100%;
}

.image-icon {
  color: white;
  margin-top: 10px;
  opacity: 1 !important;
}
</style>
