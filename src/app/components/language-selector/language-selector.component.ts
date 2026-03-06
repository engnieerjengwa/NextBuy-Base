import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css'],
})
export class LanguageSelectorComponent {
  isOpen = false;
  private isBrowser: boolean;

  languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'sn', name: 'Shona', nativeName: 'ChiShona', flag: '🇿🇼' },
    { code: 'nd', name: 'Ndebele', nativeName: 'IsiNdebele', flag: '🇿🇼' },
  ];

  currentLang: Language;

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.translate.setDefaultLang('en');

    if (this.isBrowser) {
      const saved = localStorage.getItem('nexbuy_language') || 'en';
      this.translate.use(saved);
      this.currentLang =
        this.languages.find((l) => l.code === saved) || this.languages[0];
    } else {
      this.currentLang = this.languages[0];
    }
  }

  selectLanguage(lang: Language): void {
    this.currentLang = lang;
    this.translate.use(lang.code);
    if (this.isBrowser) {
      localStorage.setItem('nexbuy_language', lang.code);
    }
    this.isOpen = false;
  }

  toggle(event: Event): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isBrowser) {
      this.isOpen = false;
    }
  }
}
