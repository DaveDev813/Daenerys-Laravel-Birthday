import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { Notify, Loading } from 'quasar';

const APP_IS_SHOW_ERROR = process.env.APP_IS_SHOW_ERROR === 'true';
const APP_INTERNAL_API = process.env.APP_INTERNAL_API;
const IS_MOCK_API_ALL = process.env.IS_MOCK_API_ALL === 'true';
const MOCK_API_URL = process.env.MOCK_API_URL;

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: IS_MOCK_API_ALL ? MOCK_API_URL : APP_INTERNAL_API,
});

api.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response

    if (typeof response.data === 'string') {
      try {
        response.data = JSON.parse(response.data);
      } catch (error) {}
    }

    const { error, message } = response.data;

    if (error) {
      Notify.create({
        type: 'warning',
        textColor: 'white',
        message,
      });
    }

    return response;
  },
  (error) => {
    const config = error.config || {};
    if (
      error.code == 'ERR_NETWORK' ||
      error.code == 'ECONNABORTED' ||
      error.response.status >= 500
    ) {
      Loading.hide();

      console.error(
        '%c NETWORK ERROR: ',
        'background-color: #f00; font-weight: bolder; color: #fff',
        error
      );

      error.isServerError = true; // custom flag to the error

      if (!config.skipGlobalErrorHandler) {
        if (APP_IS_SHOW_ERROR) {
          Notify.create({
            type: 'negative',
            multiLine: true,
            message: 'Error: ' + error.config.url,
            icon: 'error',
          });
        } else {
          Notify.create({
            type: 'negative',
            message: 'Error',
            icon: 'error',
          });
        }
      }

      return Promise.reject(error);
    } else {
      console.log(
        '%c WARNING: ',
        'background-color: #ff9033; font-weight: bolder; color: #000',
        error.message,
        error.config.url
      );
    }

    return error.response;
  }
);

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
