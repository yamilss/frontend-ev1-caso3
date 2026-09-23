import { Injectable, inject, signal } from '@angular/core';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus, AccountInfo } from '@azure/msal-browser';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private msalService = inject(MsalService);
  private msalBroadcastService = inject(MsalBroadcastService);

  public userRoles = signal<string[]>([]);
  public currentAccount = signal<AccountInfo | null>(null);

  constructor() {
    this.msalBroadcastService.inProgress$.subscribe((status) => {
      if (status === InteractionStatus.None) {
        this.sincronizarCuentaYRoles();
      }
    });
  }

  public sincronizarCuentaYRoles(): void {
    try {
      let account = this.msalService.instance.getActiveAccount();

      if (!account) {
        const accounts = this.msalService.instance.getAllAccounts();
        if (accounts.length > 0) {
          account = accounts[0];
          this.msalService.instance.setActiveAccount(account);
        }
      }

      this.currentAccount.set(account);

      if (account) {
        const claims = account.idTokenClaims as { roles?: string[] };
        if (claims && Array.isArray(claims.roles) && claims.roles.length > 0) {
          this.userRoles.set(claims.roles);
        }
        // Ejecuta la obtención y logueo del Access Token en consola
        this.obtenerAccessToken();
      } else {
        this.userRoles.set([]);
      }
    } catch (e) {
      console.warn('Esperando inicialización de MSAL...');
    }
  }

  login(): void {
    this.msalService.loginRedirect({
      scopes: ['openid', 'profile', environment.azure.api.scope],
      prompt: 'select_account',
    });
  }

  logout(): void {
    const account = this.getAccount();

    this.userRoles.set([]);
    this.currentAccount.set(null);

    if (account) {
      this.msalService.logoutRedirect({
        account: account,
        postLogoutRedirectUri: environment.azure.redirectUri,
      });
    } else {
      this.msalService.logoutRedirect({
        postLogoutRedirectUri: environment.azure.redirectUri,
      });
    }
  }

  isLoggedIn(): boolean {
    try {
      return this.msalService.instance.getAllAccounts().length > 0;
    } catch (e) {
      return false;
    }
  }

  getAccount(): AccountInfo | null {
    try {
      return this.msalService.instance.getActiveAccount();
    } catch (e) {
      return null;
    }
  }

  async obtenerAccessToken(): Promise<string | null> {
    const account = this.getAccount();

    if (!account) {
      console.error('No existe una cuenta activa.');
      return null;
    }

    try {
      const result = await this.msalService.instance.acquireTokenSilent({
        account,
        scopes: [environment.azure.api.scope],
      });

      const token = result.accessToken;
      const partes = token.split('.');

      if (partes.length !== 3) {
        console.error('El Access Token no tiene formato JWT.');
        return token;
      }

      try {
        const payload = JSON.parse(
          atob(partes[1].replace(/-/g, '+').replace(/_/g, '/'))
        );

        console.log('==============================');
        console.log('ACCESS TOKEN RUTA EXPRESS');
        console.log('==============================');
        console.log('aud:', payload.aud);
        console.log('iss:', payload.iss);
        console.log('scp:', payload.scp);
        console.log('roles:', payload.roles);
        console.log('==============================');

        if (payload && Array.isArray(payload.roles) && payload.roles.length > 0) {
          this.userRoles.set(payload.roles);
        }
      } catch (e) {
        console.error('Error al decodificar Access Token:', e);
      }

      return token;
    } catch (error) {
      console.error('Error al obtener Access Token de Ruta Express:', error);
      return null;
    }
  }

  hasRole(roleRequired: string): boolean {
    const rolesActuales = this.userRoles();
    return rolesActuales.some(
      (r) => r.toLowerCase() === roleRequired.toLowerCase()
    );
  }
}