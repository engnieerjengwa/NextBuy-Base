import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CardExpiryService {
  constructor() {}
  /**
   * Get the current month (1-12)
   * @returns The current month as a number (1-12)
   */
  getCurrentMonth(): number {
    return new Date().getMonth() + 1; // JavaScript months are 0-based
  }
  /**
   * Alternative method to get current year (same functionality, different name)
   * @returns The current year as a number
   */
  getThisYear(): number {
    return new Date().getFullYear();
  }

  /**
   * Get an array of months starting from the specified month
   * @param startMonth The month to start from (1-12)
   * @returns Observable of array of months from startMonth to 12
   */
  getCardMonth(startMonth: number): Observable<number[]> {
    let data: number[] = [];

    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }
    return of(data);
  }

  /**
   * Get an array of years for card expiry selection
   * @returns Observable of array of years starting from current year
   */
  getCardYear(): Observable<number[]> {
    let data: number[] = [];

    const startYear: number = this.getThisYear();
    const endYear: number = startYear + 10;

    for (let theYear = startYear; theYear <= endYear; theYear++) {
      data.push(theYear);
    }
    return of(data);
  }

  /**
   * Get valid months based on selected year
   * @param selectedYear The year selected by the user
   * @returns Observable of array of valid months (1-12)
   */
  getValidMonths(selectedYear: number): Observable<number[]> {
    const currentYear: number = this.getThisYear();
    const currentMonth: number = this.getCurrentMonth();
    const startMonth: number = (selectedYear === currentYear) ? currentMonth : 1;

    return this.getCardMonth(startMonth);
  }

  /**
   * Format month and year to MM/YY format for form submission
   * @param month The month (1-12)
   * @param year The year (e.g., 2023)
   * @returns Formatted string in MM/YY format (e.g., "05/23")
   */
  formatExpiryDate(month: number, year: number): string {
    const monthStr: string = month < 10 ? `0${month}` : `${month}`;
    const yearStr: string = year.toString().slice(-2);

    return `${monthStr}/${yearStr}`;
  }
}
