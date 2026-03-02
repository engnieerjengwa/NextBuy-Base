import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SavedAddress, SavedAddressRequest } from '../common/saved-address';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SavedAddressService {
  private addressUrl = `${environment.apiUrl}/addresses`;

  constructor(private httpClient: HttpClient) {}

  getAddresses(): Observable<SavedAddress[]> {
    return this.httpClient.get<SavedAddress[]>(this.addressUrl);
  }

  getAddress(addressId: number): Observable<SavedAddress> {
    const url = `${this.addressUrl}/${addressId}`;
    return this.httpClient.get<SavedAddress>(url);
  }

  createAddress(address: SavedAddressRequest): Observable<SavedAddress> {
    return this.httpClient.post<SavedAddress>(this.addressUrl, address);
  }

  updateAddress(
    addressId: number,
    address: SavedAddressRequest,
  ): Observable<SavedAddress> {
    const url = `${this.addressUrl}/${addressId}`;
    return this.httpClient.put<SavedAddress>(url, address);
  }

  deleteAddress(addressId: number): Observable<void> {
    const url = `${this.addressUrl}/${addressId}`;
    return this.httpClient.delete<void>(url);
  }

  setDefault(addressId: number): Observable<SavedAddress> {
    const url = `${this.addressUrl}/${addressId}/default`;
    return this.httpClient.put<SavedAddress>(url, {});
  }
}
