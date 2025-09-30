import { Injectable } from '@angular/core';
import { themes } from '../enums/theme';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() { }

  systemTheme$ = new BehaviorSubject<themes>(this.getTheme());

  get systemTheme(): themes {
    return this.systemTheme$.getValue();
  }

  setTheme(theme: themes): void {
    localStorage.setItem('theme', theme);
    this.systemTheme$.next(theme);
  }

  getTheme(): themes {
    const theme = localStorage.getItem('theme')?.toString();
    if (!theme) {
      return themes.LIGHT;
    }
    return theme as themes;
  }
}