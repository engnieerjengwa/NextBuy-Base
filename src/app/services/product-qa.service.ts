import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProductQuestion,
  ProductQuestionRequest,
  ProductAnswerRequest,
} from '../common/product-qa';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductQaService {
  private baseUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  getQuestionsByProductId(
    productId: number,
    page: number = 0,
    size: number = 5,
  ): Observable<GetResponseQuestions> {
    const url = `${this.baseUrl}/products/${productId}/questions`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.httpClient.get<GetResponseQuestions>(url, { params });
  }

  askQuestion(
    productId: number,
    request: ProductQuestionRequest,
  ): Observable<ProductQuestion> {
    const url = `${this.baseUrl}/products/${productId}/questions`;
    return this.httpClient.post<ProductQuestion>(url, request);
  }

  answerQuestion(
    questionId: number,
    request: ProductAnswerRequest,
  ): Observable<any> {
    const url = `${this.baseUrl}/questions/${questionId}/answers`;
    return this.httpClient.post<any>(url, request);
  }

  markAnswerHelpful(answerId: number): Observable<void> {
    const url = `${this.baseUrl}/answers/${answerId}/helpful`;
    return this.httpClient.post<void>(url, {});
  }
}

interface GetResponseQuestions {
  content: ProductQuestion[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
