import { Config } from 'vuescroll';

export const ScrollConfigs: Config = {
  vuescroll: {
    mode: 'native'
  },
  bar: {
    background: '#424453',
    size: '4px',
    disable: true
  }
};

export const OnlyVerticalScrollConfigs: Config = {
  ...ScrollConfigs,
  scrollPanel: {
    scrollingX: false
  }
};

export const OnlyHorizontalScrollConfig: Config = {
  ...ScrollConfigs,
  scrollPanel: {
    scrollingX: true,
    scrollingY: false
  }
};
export const LockScroll: Config = {
  ...ScrollConfigs,
  scrollPanel: {
    scrollingX: false,
    scrollingY: false
  }
};
