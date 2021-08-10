import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { Inject, InjectValue } from 'typescript-ioc';
import { AuthenticationService } from '@core/services/authentication.service';
import store from '@/store';
import { DIException } from '@core/domain/Exception';
import { ApiExceptions } from '@/shared/enums/api_exceptions.enum';
import { DIKeys } from '@core/modules';
import { VueRouter } from 'vue-router/types/router';
import { DataManager } from '@core/services';
import { Routers } from '@/shared/enums/routers.enum';
import { TrackingService } from '@core/tracking/service/tracking.service';
import { RegisterResponse } from '@core/domain/Response/Authentication/RegisterResponse';
import { DiAnalytics } from '@datainsider/di-web-analytics/dist/service/di_analytics';
import { PermissionService } from '@core/services/permission.service';
import { GoogleOauthConfig, OauthConfigResponse } from '@core/domain/Model/OauthConfig/GoogleOauthConfig';
import { OauthType } from '@/shared';
import { AdminSettingService } from '@core/admin/service/AdminSettingService';
import { Log } from '@core/utils';
import { LoginResponse } from '@core/domain/Response/Authentication/LoginResponse';

export enum AuthenticationStatus {
  UnIdentify,
  Authenticating, // LOADING
  Authenticated,
  UnAuthenticated
}

@Module({ store: store, name: 'authenticationStore', dynamic: true })
export class AuthenticationStore extends VuexModule {
  //state
  authStatus: AuthenticationStatus = AuthenticationStatus.UnIdentify;
  errorMessage = '';
  notifyMessage = '';
  oauthConfigResponse: OauthConfigResponse | null = null;
  googleOauthConfig: GoogleOauthConfig | null = null;
  public router!: VueRouter;

  @InjectValue(DIKeys.noAuthService)
  private noAuthenticationService!: AuthenticationService;

  @InjectValue(DIKeys.authService)
  private authenticationService!: AuthenticationService;

  @Inject
  private adminSettingService!: AdminSettingService;

  @Inject
  private permissionService!: PermissionService;

  @Inject
  private trackingService!: TrackingService;

  @Inject
  private dataManager!: DataManager;

  get isLoginWithGoogle(): boolean {
    if (this.googleOauthConfig) {
      return this.googleOauthConfig.isActive;
    }
    return false;
  }

  get googleClientId(): string {
    if (this.googleOauthConfig) {
      return (this.googleOauthConfig as GoogleOauthConfig).clientIds[0];
    }
    return '';
  }

  @Mutation
  private setAuthStatus(state: AuthenticationStatus): void {
    this.authStatus = state;
  }

  @Mutation
  private setNotifyMessage(notify: string) {
    if (ApiExceptions.emailVerificationRequired == notify) {
      this.notifyMessage = 'Your email is registered. Please check your mailbox to active registered account';
    }
  }

  @Mutation
  private setError(e: any) {
    Log.debug(e.reason, e.message, e.statusCode, typeof e, 'error in setError');
    const error = DIException.fromObject(e);
    Log.debug('in setError Function');
    switch (error.reason) {
      case ApiExceptions.emailExisted:
        this.errorMessage = 'This email existed. Please try again.';
        break;

      case ApiExceptions.emailInvalid:
        this.errorMessage = 'Your email invalid';
        break;

      case ApiExceptions.emailNotExisted:
        this.errorMessage = 'This email not existed. Please try again.';
        break;

      case ApiExceptions.emailRequired:
        this.errorMessage = 'Email required';
        break;
      case ApiExceptions.emailVerificationRequired:
        this.errorMessage = 'You need to verify your registered email';
        break;

      case ApiExceptions.alreadyExisted:
        this.errorMessage = 'This email existed. Please try again.';
        break;

      case ApiExceptions.registrationRequired:
        this.errorMessage = 'You need to register account first.';
        break;

      case ApiExceptions.verificationCodeInvalid:
        this.errorMessage = 'Verify your email again.';
        break;

      case ApiExceptions.internalError:
        this.errorMessage = 'Oops internal error! Try to refresh page or feel free contact us if issue persists.';
        break;
      case ApiExceptions.notSupported:
        this.errorMessage = error.message;
        break;

      default:
        this.errorMessage = 'Incorrect email or password';
        break;
    }
  }

  @Action
  async checkSession(): Promise<boolean> {
    const sessionId = this.dataManager.getSession();
    const userInfo = this.dataManager.getUserInfo();
    Log.debug('Authentication::userInfo::', userInfo);
    if (userInfo) {
      DiAnalytics.identify(userInfo.username);
    }
    return Promise.resolve(!!sessionId);
  }

  @Action({ rawError: true })
  async register(payload: { email: string; password: string }) {
    let registerResponse: RegisterResponse | undefined = void 0;
    const { email, password } = payload;
    try {
      this.trackingService.registerStart();
      registerResponse = await this.noAuthenticationService.register({
        email: email,
        password: password
      });
      Log.debug(registerResponse.userInfo, registerResponse.userProfile, 'response register');
      this.setNotifyMessage(ApiExceptions.emailVerificationRequired);
    } catch (e) {
      const error = DIException.fromObject(e);
      Log.debug('reason: ', error.reason, 'status: ', error.statusCode, error.message, ' error at register');
      this.setError(e);
    } finally {
      this.trackingService.trackRegister(email, registerResponse);
    }
  }

  @Action({ rawError: true })
  async directVerify(token: string): Promise<boolean> {
    this.setAuthStatus(AuthenticationStatus.UnIdentify);
    try {
      const response = await this.noAuthenticationService.directVerify(token);
      this.saveSessionAndUserProfile(response);
      this.setAuthStatus(AuthenticationStatus.Authenticated);
      return true;
    } catch (e) {
      this.setError(e);
      return false;
    }
  }

  @Action({ rawError: true })
  async resendEmail(payload: { email: string }): Promise<boolean> {
    const { email } = payload;
    try {
      await this.noAuthenticationService.resendEmail({ email: email });
      return true;
    } catch (e) {
      this.setError(e);
      return false;
    }
  }

  @Action({ rawError: true })
  async login(payload: { email: string; password: string; remember: boolean }) {
    let response: LoginResponse | undefined = void 0;
    const { email, password, remember } = payload;
    try {
      this.trackingService.loginStart();
      this.setAuthStatus(AuthenticationStatus.Authenticating);
      response = await this.noAuthenticationService.login(email, password, remember);
      this.saveSessionAndUserProfile(response);
      this.setAuthStatus(AuthenticationStatus.Authenticated);
      await this.router.replace({ name: Routers.mydata });
    } catch (e) {
      Log.debug('AuthenticationStore :: LOGIN :: Errors :', e);
      this.setAuthStatus(AuthenticationStatus.UnIdentify);
      this.setError(e);
      throw new DIException(e.message);
    } finally {
      this.trackingService.trackLogin(email, 'email', response);
    }
  }

  @Action({ rawError: true })
  async loginOAuth(payload: { oauthType: string; id: string; token: string }) {
    let response: LoginResponse | undefined = void 0;
    const { oauthType, id, token } = payload;
    try {
      this.trackingService.loginStart();
      this.setAuthStatus(AuthenticationStatus.Authenticating);
      response = await this.noAuthenticationService.loginOAuth({ oauthType, id, token });
      this.saveSessionAndUserProfile(response);
      this.setAuthStatus(AuthenticationStatus.Authenticated);
      await this.router.replace({ name: Routers.mydata });
    } catch (e) {
      Log.debug('AuthenticationStore :: LOGIN-OAUTH :: Errors :', e);
      this.setAuthStatus(AuthenticationStatus.UnIdentify);
      this.setError(e);
      throw new DIException(e.message);
    } finally {
      this.trackingService.trackLogin(id, oauthType, response);
    }
  }

  @Action
  private saveSessionAndUserProfile(loginResponse: LoginResponse) {
    this.dataManager.saveSession(loginResponse.session);
    this.dataManager.saveUserInfo(loginResponse.userInfo);
    this.dataManager.saveUserProfile(loginResponse.userProfile);
  }

  @Action
  async logout() {
    this.trackingService.trackLogout();
    this.dataManager.clearUserData();
    this.dataManager.removeSession();
    await this.router.replace({ name: Routers.login });
  }

  @Action({ rawError: true })
  async resetPassword(payload: { email: string }) {
    try {
      const { email } = payload;
      Log.debug(email, 'on reset password');
      await this.noAuthenticationService.resetPassword({
        email: email
      });
    } catch (e) {
      const error = DIException.fromObject(e);
      Log.debug(error.message, error.reason, 'at authenStore resetPassword function');
      Log.debug('AuthenticationStore :: resetPassword :: Error:', e);
      this.setError(e);
    }
  }

  @Action({ rawError: true })
  getLoginMethods(): Promise<void> {
    return this.authenticationService.getLoginMethods().then(resp => {
      // this.saveOauthConfigResponse({ oauthConfigResponse: resp });
      if (resp && resp[OauthType.GOOGLE]) {
        this.saveGoogleOauthConfig({ googleOauthConfig: resp[OauthType.GOOGLE] as GoogleOauthConfig });
      }
    });
  }

  @Mutation
  saveOauthConfigResponse(payload: { oauthConfigResponse: OauthConfigResponse }) {
    Log.debug('saveOuthConfig::', payload);
    this.oauthConfigResponse = payload.oauthConfigResponse;
  }

  @Mutation
  saveGoogleOauthConfig(payload: { googleOauthConfig: GoogleOauthConfig }) {
    Log.debug('saveGoogleOauthConfig::', payload.googleOauthConfig);
    this.googleOauthConfig = payload.googleOauthConfig;
  }

  @Action({ rawError: true })
  updateLoginMethods(request: OauthConfigResponse): Promise<OauthConfigResponse> {
    return this.adminSettingService.updateLoginMethods(request);
  }

  @Mutation
  saveGoogleSettings(payload: { whiteListEmail: string[]; isActive: boolean; clientId: string }) {
    if (this.googleOauthConfig) {
      this.googleOauthConfig.whitelistEmail = payload.whiteListEmail;
      this.googleOauthConfig.isActive = payload.isActive;
      (this.googleOauthConfig as GoogleOauthConfig).clientIds = [payload.clientId];
    }
  }

  @Action
  changePassword(payload: { oldPass: string; newPass: string }): Promise<boolean> {
    return this.authenticationService.changePassword(payload.oldPass, payload.newPass);
  }
}

export const AuthenticationModule = getModule(AuthenticationStore);
