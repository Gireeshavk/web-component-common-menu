import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  /**
   * Makes a POST request to the given endpoint, combining baseUrl and apiUrl, and sending params as the body.
   * @param baseUrl The base URL for the API (e.g., https://api.example.com)
   * @param apiUrl The endpoint path (e.g., /menu)
   * @param params The request body parameters
   */
 post<T>(baseUrl: string, apiUrl: string, params: any, token?: string): Observable<T> {
  const url = `${baseUrl}${apiUrl}`;

  let headers = new HttpHeaders();
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  return this.http.post<T>(url, params, { headers });
}
}
