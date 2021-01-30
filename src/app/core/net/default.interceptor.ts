import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponseBase } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { SettingsService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, mergeMap, switchMap, take, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

const CODEMESSAGE: { [key: number]: string } = {
  200: '',
  201: 'Les données nouvelles ou modifiées ont réussi.',
  202: "Une requête est entrée dans la file d'attente d'arrière-plan (tâche asynchrone).",
  204: 'Les données ont été supprimées avec succès.',
  400: "Une erreur s'est produite dans la demande envoyée et le serveur n'a pas créé ni modifié de données.",
  401: "L'utilisateur n'a pas d'autorisation",
  403: "L'utilisateur est autorisé, mais l'accès est interdit",
  404: "La demande envoyée concernait un enregistrement qui n'existait pas et le serveur n'a pas fonctionné.",
  406: "Le format demandé n'est pas disponible。",
  410: 'La ressource demandée est supprimée définitivement et ne sera plus disponible.',
  422: "Lors de la création d'un objet, une erreur de validation s'est produite.",
  500: "Une erreur s'est produite sur le serveur, veuillez vérifier le serveur.",
  502: 'Erreur de passerelle.',
  503: "Le service n'est pas disponible et le serveur est temporairement surchargé ou maintenu.",
  504: 'La passerelle a expiré.',
};

/**
 * 默认HTTP拦截器，其注册细节见 `app.module.ts`
 */
@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
  private refreshTokenType: 're-request' | 'auth-refresh' = 'auth-refresh';
  private refreshToking = false;
  private refreshToken$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private injector: Injector, private http_: HttpClient, private settings: SettingsService) {
    if (this.refreshTokenType === 'auth-refresh') {
      this.buildAuthRefresh();
    }
  }

  private get notification(): NzNotificationService {
    return this.injector.get(NzNotificationService);
  }

  private get tokenSrv(): ITokenService {
    return this.injector.get(DA_SERVICE_TOKEN);
  }

  private get http(): _HttpClient {
    return this.injector.get(_HttpClient);
  }

  private goTo(url: string): void {
    setTimeout(() => this.injector.get(Router).navigateByUrl(url));
  }

  private checkStatus(ev: HttpResponseBase): void {
    if ((ev.status >= 200 && ev.status < 300) || ev.status === 401) {
      return;
    }

    const errortext = CODEMESSAGE[ev.status] || ev.statusText;
    this.notification.error(` ${ev.status}: ${ev.url}`, errortext);
  }

  /**
   * 刷新 Token 请求
   */

  private refreshTokenRequest(): Observable<any> {
    const model = this.tokenSrv.get();
    console.log('this.settings._user', this.settings._user);
    console.log('this.tokenSrv.get()', this.tokenSrv.get());

    return this.http_.post(
      environment.apiUrl + `/refresh`,
      { token: model?.token, refresh_token: model?.token },
      { headers: { refresh_token: model?.token || '' } },
    );
  }

  // #region 刷新Token方式一：使用 401 重新刷新 Token

  private tryRefreshToken(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // 1、若请求为刷新Token请求，表示来自刷新Token可以直接跳转登录页
    if ([`api/refresh`].some((url) => req.url.includes(url))) {
      this.toLogin();
      console.log('test 1 __________');
      return throwError(ev);
    }
    // 2、如果 `refreshToking` 为 `true` 表示已经在请求刷新 Token 中，后续所有请求转入等待状态，直至结果返回后再重新发起请求
    if (this.refreshToking) {
      return this.refreshToken$.pipe(
        filter((v) => !!v),
        take(1),
        switchMap(() => next.handle(this.reAttachToken(req))),
      );
    }
    // 3、尝试调用刷新 Token
    this.refreshToking = true;
    this.refreshToken$.next(null);
    console.log('test de refresh 1 _____');
    return this.refreshTokenRequest().pipe(
      switchMap((res) => {
        // 通知后续请求继续执行
        this.refreshToking = false;
        this.refreshToken$.next(res);
        // 重新保存新 token
        this.tokenSrv.set(res);
        // 重新发起请求
        return next.handle(this.reAttachToken(req));
      }),
      catchError((err) => {
        this.refreshToking = false;
        this.toLogin();
        console.log('test 2 __________');

        return throwError(err);
      }),
    );
  }

  /**
   * 重新附加新 Token 信息
   *
   * > 由于已经发起的请求，不会再走一遍 `@delon/auth` 因此需要结合业务情况重新附加新的 Token
   */
  private reAttachToken(req: HttpRequest<any>): HttpRequest<any> {
    // 以下示例是以 NG-ALAIN 默认使用 `SimpleInterceptor`
    const token = this.tokenSrv.get()?.token;
    return req.clone({
      setHeaders: {
        token: `Bearer ${token}`,
      },
    });
  }

  // #endregion

  // #region 刷新Token方式二：使用 `@delon/auth` 的 `refresh` 接口

  private buildAuthRefresh(): void {
    this.tokenSrv.refresh
      .pipe(
        filter(() => !this.refreshToking),
        switchMap(() => {
          this.refreshToking = true;
          console.log('test de refresh 1 _____');
          return this.refreshTokenRequest();
        }),
      )
      .subscribe(
        (res) => {
          // TODO: Mock expired value
          res.user.expired = +new Date() + 1000 * 60 * 5;
          this.refreshToking = false;
          this.tokenSrv.set(res.user);
        },
        (error) => {
          console.log('test 4 __________'), this.toLogin();
        },
      );
  }

  // #endregion

  private toLogin(): void {
    this.notification.error(`Non connecté ou la connexion a expiré, veuillez vous reconnecter`, ``);
    this.goTo('/passport/login');
  }

  private handleData(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // 可能会因为 `throw` 导出无法执行 `_HttpClient` 的 `end()` 操作
    if (ev.status > 0) {
      this.http.end();
    }
    this.checkStatus(ev);
    // 业务处理：一些通用操作
    switch (ev.status) {
      case 200:
        break;
      case 401:
        if (this.refreshTokenType === 're-request') {
          return this.tryRefreshToken(ev, req, next);
        }
        this.toLogin();
        console.log('test 3 __________');
        break;
      case 403:
      case 404:
      case 500:
        this.goTo(`/exception/${ev.status}`);
        break;
      default:
        if (ev instanceof HttpErrorResponse) {
          console.warn('ccc', ev);
        }
        break;
    }
    if (ev instanceof HttpErrorResponse) {
      return throwError(ev);
    } else {
      return of(ev);
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 统一加上服务端前缀
    let url = req.url;
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      url = environment.SERVER_URL + url;
    }

    const newReq = req.clone({ url });
    return next.handle(newReq).pipe(
      mergeMap((ev) => {
        // 允许统一对请求错误处理
        if (ev instanceof HttpResponseBase) {
          return this.handleData(ev, newReq, next);
        }
        // 若一切都正常，则后续操作
        return of(ev);
      }),
      catchError((err: HttpErrorResponse) => this.handleData(err, newReq, next)),
    );
  }
}
