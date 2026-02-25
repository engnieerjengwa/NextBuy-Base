import { Component, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
} from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { ProductSearchResult } from '../../common/product';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnDestroy {
  searchQuery: string = '';
  suggestions: ProductSearchResult[] = [];
  showDropdown: boolean = false;
  highlightedIndex: number = -1;

  private searchSubject = new Subject<string>();
  private subscription: Subscription;

  constructor(
    private router: Router,
    private productService: ProductService,
    private elementRef: ElementRef,
  ) {
    this.subscription = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((query) => query.length >= 2),
        switchMap((query) => this.productService.autocomplete(query, 5)),
      )
      .subscribe({
        next: (results) => {
          this.suggestions = results;
          this.showDropdown = results.length > 0;
          this.highlightedIndex = -1;
        },
        error: () => {
          this.suggestions = [];
          this.showDropdown = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
    if (value.length < 2) {
      this.suggestions = [];
      this.showDropdown = false;
      return;
    }
    this.searchSubject.next(value);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showDropdown) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex = Math.min(
          this.highlightedIndex + 1,
          this.suggestions.length - 1,
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0) {
          this.selectSuggestion(this.suggestions[this.highlightedIndex]);
        } else {
          this.doSearch(this.searchQuery);
        }
        break;
      case 'Escape':
        this.closeDropdown();
        break;
    }
  }

  selectSuggestion(suggestion: ProductSearchResult): void {
    this.closeDropdown();
    this.router.navigateByUrl(`/products/${suggestion.id}`);
  }

  doSearch(value: string): void {
    this.closeDropdown();
    if (value.trim()) {
      this.router.navigateByUrl(`/search/${value}`);
    }
  }

  closeDropdown(): void {
    this.showDropdown = false;
    this.highlightedIndex = -1;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
