import {Component, OnDestroy} from '@angular/core';
import {AuthorizationService} from './authorization.service';
import {Router} from '@angular/router';
import {SystemLang} from 'ui-lib';
import {Subscription} from 'rxjs';

interface I18N {
  userLabel: string;
  userHint: string;
  pwdLabel: string;
  pwdHint: string;
  btnLogin: string;
  btnCancel: string;
  err: string;
}
const CI18N = {
  en: {
    userLabel: 'User name:',
    userHint: 'Please, input your user name or email',
    pwdLabel: 'Password',
    pwdHint: 'Please, input your password',
    btnLogin: 'Login',
    btnCancel: 'Cancel',
    err: 'Incorrect user name or password'
  },
  uk: {
    userLabel: 'Логін:',
    userHint: 'Будьласка, введіть свій логін',
    pwdLabel: 'Пароль:',
    pwdHint: 'Будьласка, введіть свій пароль',
    btnLogin: 'Продовжити',
    btnCancel: 'Відміна',
    err: 'Логін або пароль не вірні'
  },
  ru: {
    userLabel: 'Логин:',
    userHint: 'Введите свой логин',
    pwdLabel: 'Пароль:',
    pwdHint: 'Введите свой пароль',
    btnLogin: 'Продолжить',
    btnCancel: 'Отмена',
    err: 'Ошибка при вводе логина или пароля'
  }
};
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.sass']
})
export class LoginPageComponent implements OnDestroy {
  userName: string;
  password: string;
  text: string;
  i18n: I18N;
  private langSubs: Subscription;

  constructor(private authService: AuthorizationService, private router: Router, systemLang: SystemLang) {
    this.i18n = CI18N[systemLang.getLocale()];
    if (!this.i18n) {
      this.i18n = CI18N.en;
    }
    this.langSubs = systemLang.onChange().subscribe((v) => {
      if (typeof v === 'string') {
        this.i18n = CI18N[v];
        if (!this.i18n) {
          this.i18n = CI18N.en;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.langSubs.unsubscribe();
  }

  onClickLogin(): void {
    if (this.userName && this.password) {
      this.authService.logInBasic(this.userName, this.password).subscribe(b => {
        if (b) {
          if (this.authService.redirectUrl) {
            this.router.navigate([this.authService.redirectUrl]);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.text = this.i18n.err;
        }
      }, err => {
        this.text = this.i18n.err;
      });
    }
  }
  onClickCancel(): void {
    this.authService.logOut();
    this.router.navigate(['/']);
  }
}
