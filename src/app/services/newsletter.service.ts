import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MessageResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NewsletterService {
  private baseUrl = `${environment.apiUrl}/newsletter`;

  constructor(private httpClient: HttpClient) {}

  subscribe(email: string): Observable<MessageResponse> {
    return this.httpClient.post<MessageResponse>(`${this.baseUrl}/subscribe`, {
      email,
    });
  }

  unsubscribe(email: string): Observable<MessageResponse> {
    return this.httpClient.post<MessageResponse>(
      `${this.baseUrl}/unsubscribe`,
      { email },
    );
  }
}
