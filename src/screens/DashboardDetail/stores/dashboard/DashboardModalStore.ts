import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { ContextMenuItem, Stores } from '@/shared';
import { TextWidget, Widget } from '@core/domain/Model';
import DiShareModal from '@/shared/components/DiShareModal.vue';
import { ResourceType } from '@/utils/permission_utils';
import { Log } from '@core/utils';

@Module({ namespaced: true, store: store, dynamic: true, name: Stores.dashboardModal })
export class DashboardModalStore extends VuexModule {
  contextMenu?: any = void 0;
  editTextModal?: any = void 0;
  shareModal?: DiShareModal = void 0;
  editChartTextModal?: any = void 0;

  @Action
  showContextMenu(payload: { event: Event; items: ContextMenuItem[] }) {
    this.contextMenu?.show(payload.event, payload.items);
  }

  @Action
  hideContextMenu() {
    this.contextMenu?.hide();
  }

  @Action
  showEditChartTextModal(payload: { data: Widget }) {
    this.editChartTextModal?.show(payload.data.name, payload.data);
  }

  @Action
  showEditTextModal(payload: { textWidget: TextWidget; isEdit: boolean }) {
    const { textWidget, isEdit } = payload;
    this.editTextModal?.show(textWidget, isEdit);
  }

  @Action
  showShareModal(payload: { resourceType: ResourceType; resourceId: number }) {
    Log.debug('showShare::', payload.resourceType);
    this.shareModal?.show(payload.resourceType, payload.resourceId);
  }
}

export const DashboardModalModule = getModule(DashboardModalStore);
