import { BaseClient, HttpClient, HttpClientWithoutWorker } from '@core/services/base.service';
import Axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { JsonUtils } from '@core/utils';
import { DIApiException, DIException } from '@core/domain/Exception';
import { ListUtils } from '@/utils';
import { ApiExceptions } from '@/shared';
import { AuthenticationModule } from '@/store/modules/authentication.store';
import { DI } from '@core/modules';
import { DataManager } from '@core/services';
import { StringUtils } from '@/utils/string.utils';

export abstract class AbstractClientBuilder {
  abstract build(): BaseClient;

  protected createClient(baseUrl?: string, timeout?: number) {
    return Axios.create({
      baseURL: baseUrl,
      timeout: timeout || 30000,
      headers: {
        'Content-Type': 'application/json'
      },
      transformRequest: request => {
        if (request instanceof FormData) {
          return request;
        } else {
          return JsonUtils.toJson(request, true);
        }
      },
      transformResponse: response => response,
      withCredentials: false
    });
  }
}

export abstract class ClientBuilder extends AbstractClientBuilder {
  protected baseUrl?: string;
  protected timeout?: number;

  withBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
    return this;
  }

  withTimeout(durationInMillis: number) {
    this.timeout = durationInMillis || 30000;
    return this;
  }

  protected async responseError(errors: any[]): Promise<DIException> {
    if (ListUtils.isNotEmpty(errors)) {
      const apiException = this.parseError(errors[0]);
      if (apiException.reason == ApiExceptions.notAuthenticated) {
        await AuthenticationModule.logout();
      }
      return Promise.reject(apiException);
    } else {
      return Promise.reject(new DIException('Unknown exception'));
    }
  }

  protected parseError(reason: AxiosError<string>): DIException {
    if (reason.response?.data) {
      const apiException = JsonUtils.fromObject<any>(reason.response.data);
      return DIApiException.fromObject(apiException);
    } else {
      return new DIException(reason.request);
    }
  }
}

export class DefaultClientBuilder extends ClientBuilder {
  build(): BaseClient {
    return new HttpClient(this.createClient(this.baseUrl, this.timeout));
  }
}

export class AuthAndTokenClientBuilder extends ClientBuilder {
  build(): BaseClient {
    const client = this.createClient(this.baseUrl, this.timeout);

    client.interceptors.request.use(
      request => this.injectTokenAndSession(request),
      error => {
        return Promise.reject(error);
      }
    );
    client.interceptors.response.use(
      response => response,
      (...error) => this.responseError(error)
    );
    return new HttpClient(client);
  }

  private injectTokenAndSession(request: AxiosRequestConfig): AxiosRequestConfig {
    const dataManager = DI.get(DataManager);
    const session = dataManager.getSession();
    const token = dataManager.getToken();
    if (token) {
      request.headers['Token-Id'] = token;
    }
    if (session && StringUtils.isNotEmpty(session)) {
      request.headers['Authorization'] = session;
    }
    return request;
  }
}

export class AuthClientBuilder extends ClientBuilder {
  build(): BaseClient {
    const client = this.createClient(this.baseUrl, this.timeout);

    client.interceptors.request.use(
      request => this.injectSessionId(request),
      error => {
        return Promise.reject(error);
      }
    );
    client.interceptors.response.use(
      response => response,
      (...error) => this.responseError(error)
    );
    return new HttpClient(client);
  }

  private injectSessionId(request: AxiosRequestConfig): AxiosRequestConfig {
    const dataManager = DI.get(DataManager);
    const session = dataManager.getSession();
    if (session && StringUtils.isNotEmpty(session)) {
      request.headers['Authorization'] = session;
    }
    return request;
  }
}

export class DefaultClientWithoutWorkerBuilder extends ClientBuilder {
  build(): BaseClient {
    return new HttpClientWithoutWorker(this.createClient(this.baseUrl, this.timeout));
  }
}

export class AuthAndTokenClientWithoutWorkerBuilder extends ClientBuilder {
  build(): BaseClient {
    const client = this.createClient(this.baseUrl, this.timeout);

    client.interceptors.request.use(
      request => this.injectTokenAndSession(request),
      error => {
        return Promise.reject(error);
      }
    );
    client.interceptors.response.use(
      response => response,
      (...error) => this.responseError(error)
    );
    return new HttpClientWithoutWorker(client);
  }

  private injectTokenAndSession(request: AxiosRequestConfig): AxiosRequestConfig {
    const dataManager = DI.get(DataManager);
    const session = dataManager.getSession();
    const token = dataManager.getToken();
    if (token) {
      request.headers['Token-Id'] = token;
    }
    if (session && StringUtils.isNotEmpty(session)) {
      request.headers['Authorization'] = session;
    }
    return request;
  }
}

export class AuthClientWithoutWorkerBuilder extends ClientBuilder {
  build(): BaseClient {
    const client = this.createClient(this.baseUrl, this.timeout);

    client.interceptors.request.use(
      request => this.injectSessionId(request),
      error => {
        return Promise.reject(error);
      }
    );
    client.interceptors.response.use(
      response => response,
      (...error) => this.responseError(error)
    );
    return new HttpClientWithoutWorker(client);
  }

  private injectSessionId(request: AxiosRequestConfig): AxiosRequestConfig {
    const dataManager = DI.get(DataManager);
    const session = dataManager.getSession();
    if (session && StringUtils.isNotEmpty(session)) {
      request.headers['Authorization'] = session;
    }
    return request;
  }
}

export class ClientBuilders {
  static defaultBuilder() {
    return new DefaultClientBuilder();
  }

  static authBuilder() {
    return new AuthClientBuilder();
  }

  static authAndTokenBuilder() {
    return new AuthAndTokenClientBuilder();
  }
}

export class ClientWithoutWorkerBuilders {
  static defaultBuilder() {
    return new DefaultClientWithoutWorkerBuilder();
  }

  static authBuilder() {
    return new AuthAndTokenClientWithoutWorkerBuilder();
  }

  static authAndTokenBuilder() {
    return new AuthClientWithoutWorkerBuilder();
  }
}
