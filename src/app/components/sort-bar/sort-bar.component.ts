import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SortOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-sort-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sort-bar.component.html',
  styleUrls: ['./sort-bar.component.css'],
})
export class SortBarComponent {
  @Input() totalResults: number = 0;
  @Input() searchQuery: string = '';
  @Input() currentSort: string = 'relevance';
  @Output() sortChanged = new EventEmitter<string>();

  sortOptions: SortOption[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
    { value: 'best_selling', label: 'Best Selling' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'name_asc', label: 'Name: A to Z' },
  ];

  onSortChange(value: string): void {
    this.currentSort = value;
    this.sortChanged.emit(value);
  }
}
