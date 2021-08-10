<template>
  <div>
    <b-form-input :id="randomId" :placeholder="placeholder" autocomplete="off" v-model="keyword" @input="showSuggestList" @focus="handleFocus" debounce="400" />
    <BPopover v-if="isNotEmptyData" :target="randomId" custom-class="custom-listing-popover" placement="bottom" triggers="blur" :show.sync="isShowSuggestList">
      <div class="listing-data overflow-hidden">
        <div class="status-widget">
          <vuescroll>
            <div class="vuescroll-body">
              <div v-for="(label, index) in filteredData" :key="index" class="item" @click="handleSelectItem(label)">{{ label }}</div>
            </div>
          </vuescroll>
        </div>
        <!--        <div v-else class="text-center">Not found database name</div>-->
      </div>
    </BPopover>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Log } from '@core/utils';
import { ListUtils, RandomUtils } from '@/utils';

@Component
export default class SuggestionInput extends Vue {
  private isShowSuggestList = false;
  private randomId = `suggest-popover-${RandomUtils.nextInt(0, 50000).toString()}`;

  @Prop({ default: 'Input' })
  placeholder!: string;

  @Prop({ default: [] })
  private suggestionTexts!: string[];
  @Prop()
  initValue!: string;
  keyword = this.initValue;

  private get isNotEmptyData(): boolean {
    return ListUtils.isNotEmpty(this.filteredData);
  }

  private get filteredData(): string[] {
    return this.suggestionTexts.filter(label => label.toLowerCase().includes(this.keyword.toLowerCase()));
  }

  showSuggestList() {
    this.isShowSuggestList = true;
  }

  private handleFocus() {
    this.showSuggestList();
    this.$emit('onFocus');
  }

  @Watch('keyword')
  onInputChange(newValue: string) {
    this.$emit('onChange', newValue);
  }

  private handleSelectItem(label: string) {
    Log.debug('handleSelectedLabel::label::', label);
    this.keyword = label;
    this.isShowSuggestList = false;
  }
}
</script>

<style lang="scss" scoped>
.suggestion-input {
  width: 100%;
}

.custom-listing-popover {
  ::v-deep {
    position: absolute;
    background: none;
    max-width: unset;
    width: unset;
    .arrow {
      display: none;
    }
    .popover-body {
      padding: 0;
    }
  }

  .listing-data {
    padding: 8px 0;
    width: 350px;
    z-index: 100;
    margin-top: -10px;
    background: var(--primary);
    border-radius: 4px;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.16), 0 4px 4px 0 rgba(0, 0, 0, 0.16);
    color: white;
    font-size: 14px;

    .vuescroll-body {
      max-height: 185px;

      .item {
        padding: 8px 0 8px 16px;
        font-size: 14px;
        cursor: pointer;
        &:hover {
          background: var(--secondary);
        }
      }
    }
  }
}
</style>
