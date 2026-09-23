import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalInterceptor,
  MsalInterceptorConfiguration,
  MsalService,
} from '@azure/msal-angular';
import { InteractionType, BrowserCacheLocation } from '@azure/msal-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { MSALInstanceFactory } from './factories/msal-instance.factory';
import { environment } from '../environments/environment';


const msalInterceptorConfig: MsalInterceptorConfiguration = {
  interactionType: InteractionType.Redirect,

  protectedResourceMap: new Map([
  [
    `${environment.azure.api.url}/v1/ordenes`,
    [environment.azure.api.scope],
  ],
])
,
};






export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),

    provideHttpClient(withInterceptorsFromDi()),

    {
  provide: MSAL_INTERCEPTOR_CONFIG,
  useValue: msalInterceptorConfig,
},


    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },

    {
      provide: MSAL_GUARD_CONFIG,
      useValue: {
        interactionType: InteractionType.Redirect,
        authRequest: {
          scopes: ['openid', 'profile'],
        },
      },
    },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },

    MsalService,
    MsalGuard,
    MsalBroadcastService,
  ],
};
