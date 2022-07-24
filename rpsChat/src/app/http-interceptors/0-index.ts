import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { CredentialsInterceptor } from './1-CredentialsInterceptor';

/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: CredentialsInterceptor, multi: true },
];