<template>
  <p class="revert-button unselectable" @click="handleRevert">Revert to default</p>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator';

@Component
export default class RevertButton extends Vue {
  @Emit('click')
  private handleRevert(event: MouseEvent) {
    return event;
  }
}
</script>
