import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

export const PUBLIC_API_ORIGIN = new InjectionToken<string>('PUBLIC_API_ORIGIN', {
  providedIn: 'root',
  factory: () => '',
});

export interface PublicContent {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body_html: string;
  featured: boolean;
  published_at: string;
  metadata_json: string;
  revision: number;
}

export interface PublicContentPage {
  items: PublicContent[];
  next_cursor: string | null;
  page_size: number;
}

@Injectable({ providedIn: 'root' })
export class ContentApiService {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(PUBLIC_API_ORIGIN).replace(/\/$/, '');

  list(kind: 'services' | 'projects'): Observable<PublicContentPage> {
    return this.http.get<PublicContentPage>(`${this.origin}/api/v1/${kind}?page_size=12`);
  }

  detail(kind: 'services' | 'projects', slug: string): Observable<PublicContent> {
    return this.http
      .get<PublicContent>(`${this.origin}/api/v1/${kind}/${encodeURIComponent(slug)}`)
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => error)));
  }
}
