import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, Observable, of, throwError } from 'rxjs';

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

export interface ResolvedContentError {
  error: 'not-found' | 'unavailable';
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

export const publicContentResolver: ResolveFn<
  PublicContentPage | PublicContent | ResolvedContentError
> = (route) => {
  const api = inject(ContentApiService);
  const kind = route.data['kind'] as string;
  const request: Observable<PublicContentPage | PublicContent> =
    kind === 'services' || kind === 'projects'
      ? api.list(kind)
      : api.detail(kind === 'service' ? 'services' : 'projects', route.paramMap.get('slug') ?? '');
  return request.pipe(
    catchError((failure: HttpErrorResponse) =>
      of({ error: failure.status === 404 ? 'not-found' : 'unavailable' } as ResolvedContentError),
    ),
  );
};

export const homeProjectsResolver: ResolveFn<PublicContentPage> = () =>
  inject(ContentApiService)
    .list('projects')
    .pipe(catchError(() => of({ items: [], next_cursor: null, page_size: 12 })));

export const relatedProjectsResolver: ResolveFn<PublicContentPage> = () =>
  inject(ContentApiService)
    .list('projects')
    .pipe(catchError(() => of({ items: [], next_cursor: null, page_size: 12 })));

export const cabinetryContentResolver: ResolveFn<PublicContent | ResolvedContentError> = () =>
  inject(ContentApiService)
    .detail('services', 'custom-cabinetry')
    .pipe(
      catchError((failure: HttpErrorResponse) =>
        of({ error: failure.status === 404 ? 'not-found' : 'unavailable' } as ResolvedContentError),
      ),
    );
