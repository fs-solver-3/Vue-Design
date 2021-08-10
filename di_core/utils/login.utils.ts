import { DIException } from '@core/domain/Exception';

export abstract class LoginUtils {
  static setupGoogleLogin(
    setupBtnRef: string,
    clientId: string,
    onsuccess: (googleUser: gapi.auth2.GoogleUser) => void,
    onfailure: (reason: string) => void
  ): void {
    if (!window.gapi) {
      throw new DIException('"https://apis.google.com/js/api:client.js" needs to be included as a <script>.');
    }

    if (!clientId) {
      throw new DIException('Client Id must be specified.');
    }
    window.gapi.load('auth2', async () => {
      // eslint-disable-next-line @typescript-eslint/camelcase
      const auth2 = window.gapi.auth2.init({ client_id: clientId });
      if (auth2.isSignedIn.get()) {
        auth2.signOut();
        auth2.disconnect();
      }
      auth2.attachClickHandler(setupBtnRef, {}, onsuccess, onfailure);
    });
  }
}
