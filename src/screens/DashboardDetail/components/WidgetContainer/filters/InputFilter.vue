<template>
  <SearchInput hintText="Type here to filter by keyword" @text-changed="handleTextChange">
    <img src="@/assets/icon/ic_edit.svg" class="ic-16" />
  </SearchInput>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class InputFilter extends Vue {
  @Prop({ required: true })
  // filter!: InputValueFilter;
  //
  // currentFilter = InputValueFilter.empty();
  mounted() {
    // if (this.filter) this.currentFilter = Object.assign(this.currentFilter, this.filter);
  }

  handleTextChange(text: string) {
    // this.currentFilter.setValue(text);
    // this.$parent.$emit('change', this.currentFilter);
  }
}
</script>
