<template>
  <BModal id="mdRename" ref="mdRename" centered ok-title="Rename" cancel-title="Cancel" title="Rename" class="rounded" size="md" @ok="rename">
    <template v-slot:modal-header="{ close }">
      <h6 class="modal-title">{{ title }}</h6>
      <button type="button" class="close btn-ghost" @click.prevent="close()" aria-label="Close">
        <BIconX class="button-x" />
      </button>
    </template>
    <template v-slot:default="{ ok }">
      <b-input v-model="name" type="text" variant="dark" class="p-3 h-42px" placeholder="Input your title" autofocus v-on:keyup.enter="ok()" />
    </template>
    <template v-slot:modal-footer="{ cancel, ok }">
      <b-button class="flex-fill text-white h-42px" variant="secondary" @click="cancel()">
        Cancel
      </b-button>
      <b-button class="flex-fill h-42px" variant="primary" @click="ok()">
        Rename
      </b-button>
    </template>
  </BModal>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';

@Component
export default class DiRenameModal extends Vue {
  @Ref()
  mdRename!: BModal;

  @Prop({ type: String, default: 'Rename' })
  title!: string;

  name?: string;
  data: object = {};

  constructor() {
    super();
    this.name = '';
  }

  show(currentName: string, data: object) {
    this.name = currentName;
    this.mdRename.show();
    this.data = data;
  }

  rename() {
    if (this.name) this.$emit('rename', this.name, this.data);
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/di-variables.scss';

.button-x {
  color: $greyTextColor;
}

.button {
  padding: 4px;
}

.modal-header .close {
  padding: 4px;
  margin: -2px;
}
</style>
