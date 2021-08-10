<template>
  <div class="container-fluid h-100">
    <div class="row h-100">
      <div class="col-xl-4 w-100 p-0 left-screen">
        <div class="deco2">
          <img alt="deco2" src="@/assets/icon/ic_deco_2.svg" />
        </div>
        <div class="auth">
          <div class="auth-logo">
            <a class="main-logo" href="#">
              <img alt="DataInsider-logo" src="@/assets/logo/logo.webp" />
            </a>
          </div>
          <div class="auth-form regular-text">
            <div class="auth-form-change flex-column align-items-start">
              <router-link disabled="true" to="/login">Log in</router-link>
              <div v-if="isShowAccountExample" class="text-left example-text cursor-default">Test account: {{ usernameExample }}/{{ passwordExample }}</div>
            </div>
            <hr />
            <transition mode="out-in" name="slide">
              <router-view></router-view>
            </transition>
          </div>
        </div>
        <div class="deco1">
          <img id="deco1" alt="deco1" src="@/assets/icon/ic_deco_1.svg" />
        </div>
      </div>
      <div class="col-md-8 w-100 p-0 right-screen d-none d-xl-block">
        <div>
          <div class="deco3">
            <img alt="deco3" src="@/assets/icon/ic_deco_3.svg" />
          </div>
          <div class="deco-ill">
            <img alt="deco illustration" src="@/assets/icon/ic_illustration.svg" />
          </div>
          <div class="deco4">
            <img alt="deco4" src="@/assets/icon/ic_deco_4.svg" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SignIn from './components/SignIn/SignIn.vue';

@Component({
  components: {
    SignIn
  }
})
export default class Login extends Vue {
  // @ts-ignored
  private readonly config = require('@/shared/constants/config.json');

  private get usernameExample(): string {
    return this.config.login.account.username ?? '';
  }

  private get passwordExample(): string {
    return this.config.login.account.password ?? '';
  }

  private get isShowAccountExample(): boolean {
    return this.config.login.isShowHint ?? false;
  }
}
</script>

<style lang="scss">
@import '~@/themes/scss/mixin.scss';

.deco2 {
  position: absolute;
  right: 0;
  top: 1rem;
}

.auth-logo {
  .main-logo {
    align-items: center;
    display: flex;
    height: 42px;
    margin: auto;
    text-align: center;
    width: 332px;

    img {
      height: 40px;
      margin-right: 8px;
    }

    &:hover {
      text-decoration: none;
    }
  }
}

.left-screen {
  background-color: var(--primary);
  height: 100%;
  position: relative;
  width: 100%;
  z-index: 0;
}

.right-screen {
  background-color: var(--accent);
  height: 100%;
  position: relative;
  width: 100%;
}

.auth {
  display: flex;
  flex-flow: column;
  position: relative;
  top: 13%;
  z-index: 1;
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.5s, transform 1s;
}

.slide-enter,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-300%);
}

.auth-logo {
  margin-bottom: 3rem;
}

.auth-form {
  background-color: var(--secondary) !important;
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
  margin: auto;
  max-width: 332px;
}

.auth-form-change {
  display: flex;
  justify-items: start;
}

.auth-form-change a {
  color: var(--white);
  font-size: 15px;
  letter-spacing: 0.1px;
  padding: 24px 12px 11px;
  text-decoration: none;
}

.router-link-exact-active {
  //border-bottom: solid 4px var(--accent);
  margin-bottom: 0;
  padding-bottom: 11px;
  z-index: 1;
}

.lb-forgot-password {
  text-align: left;
}

.lb-forgot-password label {
  transform: translateY(11%);
}

.lb-forgot-password img {
  transform: translateY(-2%);
}

hr {
  background-color: #000000;
  border: none;
  display: block;
  height: 1px;
  margin: 0 !important;
  opacity: 0.3;
  padding: 0 !important;
  transform: translateY(-25%);
}

.deco1 {
  bottom: 1%;
  left: 40%;
  position: absolute;
  z-index: -1;
}

//right screen
.deco3 {
  position: absolute;
  right: 0;
}

.deco4 {
  bottom: 0;
  left: 20%;
  position: absolute;
  right: 20%;
}

.deco-ill {
  left: 20%;
  position: absolute;
  right: 20%;
  top: 16%;
}

body,
html {
  height: 100% !important;
  width: 100% !important;
}

#app {
  height: 100% !important;
}

@media screen and (max-width: 768px) {
  .auth {
    top: 9%;
  }
  .auth-logo {
    margin-bottom: 2.8rem;
  }
}

@media screen and (max-width: 425px) {
  .auth {
    top: 6.5%;
  }

  .auth-logo {
    margin-bottom: 2.65rem;
  }

  .deco1 {
    bottom: 0.5%;
    width: 76px;
  }
}

@media screen and (max-width: 375px) {
  .auth {
    top: 6%;
  }

  .auth-form {
    width: 100%;
  }

  .auth-logo {
    margin-bottom: 2.55rem;
  }
}

@media screen and (max-width: 320px) {
  .auth {
    top: 6%;
  }

  .auth-form {
    width: 100%;
  }

  .auth-logo {
    margin-bottom: 2.5rem;
  }
}

.example-text {
  @include regular-text();
  color: var(--white);
  font-size: 14px;
  font-style: normal;
  letter-spacing: 0.2px;
  line-height: 1.43;
  opacity: 0.5;
  margin: 0 12px 12px 12px;
}
</style>
