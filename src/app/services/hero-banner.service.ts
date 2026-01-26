import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HeroBanner } from '../common/hero-banner';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HeroBannerService {
  private baseUrl = environment.apiUrl + '/hero-banners';

  constructor(private httpClient: HttpClient) {}

  /**
   * Get all hero banners
   * @returns Observable of HeroBanner array
   */
  getHeroBanners(): Observable<HeroBanner[]> {
    return this.httpClient.get<HeroBanner[]>(this.baseUrl);
  }

  /**
   * Get active hero banners
   * @returns Observable of HeroBanner array
   */
  getActiveHeroBanners(): Observable<HeroBanner[]> {
    return this.httpClient.get<HeroBanner[]>(`${this.baseUrl}/active`);
  }

  /**
   * Get currently active hero banners (based on dates)
   * @returns Observable of HeroBanner array
   */
  getCurrentlyActiveHeroBanners(): Observable<HeroBanner[]> {
    return this.httpClient.get<HeroBanner[]>(`${this.baseUrl}/current`);
  }

  /**
   * Get a hero banner by ID
   * @param id The hero banner ID
   * @returns Observable of HeroBanner
   */
  getHeroBannerById(id: number): Observable<HeroBanner> {
    return this.httpClient.get<HeroBanner>(`${this.baseUrl}/${id}`);
  }
}
