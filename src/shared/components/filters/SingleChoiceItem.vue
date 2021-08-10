<template>
  <div class="choice-item cursor-pointer" @click="handClickItem">
    <template v-if="isSelected">
      <ActiveSingleChoiceIcon color="var(--active-background-color, #57F)" />
    </template>
    <template v-else>
      <DeactivateSingleChoiceIcon color="var(--deactivate-background-color, #9799AC)" />
    </template>
    <div class="single-line">{{ item.displayName }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import { SelectOption } from '@/shared';

@Component
export default class SingleChoiceItem extends Vue {
  @Prop({ type: Boolean, default: false })
  isSelected!: boolean;
  @Prop({ required: true })
  private readonly item!: SelectOption;

  @Emit('onSelectItem')
  private handClickItem(): SelectOption {
    return this.item;
  }
}
</script>
