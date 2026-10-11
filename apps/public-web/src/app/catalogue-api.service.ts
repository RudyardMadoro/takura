import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';
import { PUBLIC_API_ORIGIN } from './content-api.service';
export interface BoardVariant {
  id: string;
  sku: string;
  material_type: string;
  finish: string;
  thickness_mm: string;
  sheet_length_mm: number;
  sheet_width_mm: number;
  unit: string;
  availability_wording: string;
  collection_delivery_wording: string;
  revision: number;
}
export interface BoardProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  variants: BoardVariant[];
}
export interface BoardPage {
  items: BoardProduct[];
  next_cursor: string | null;
  page_size: number;
}
export interface HardwareItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  availability_wording: string;
  revision: number;
}
@Injectable({ providedIn: 'root' })
export class CatalogueApiService {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(PUBLIC_API_ORIGIN).replace(/\/$/, '');
  boards(params: Record<string, string>): Observable<BoardPage> {
    let query = new HttpParams().set('page_size', '12');
    for (const [k, v] of Object.entries(params)) if (v) query = query.set(k, v);
    return this.http.get<BoardPage>(`${this.origin}/api/v1/catalogue/boards`, { params: query });
  }
  board(slug: string) {
    return this.http.get<BoardProduct>(
      `${this.origin}/api/v1/catalogue/boards/${encodeURIComponent(slug)}`,
    );
  }
  hardware() {
    return this.http.get<HardwareItem[]>(`${this.origin}/api/v1/catalogue/hardware`);
  }
  submit(body: unknown, key: string) {
    return this.http.post<{ reference: string; result: string; next_step: string }>(
      `${this.origin}/api/v1/enquiries`,
      body,
      { headers: new HttpHeaders({ 'Idempotency-Key': key }) },
    );
  }
}
export const catalogueResolver: ResolveFn<
  BoardPage | BoardProduct | HardwareItem[] | { error: string }
> = (route: ActivatedRouteSnapshot) => {
  const api = inject(CatalogueApiService);
  const kind = route.data['kind'];
  let request: Observable<BoardPage | BoardProduct | HardwareItem[]>;
  if (kind === 'boards')
    request = api.boards(
      Object.fromEntries(
        route.queryParamMap.keys.map((k) => [k, route.queryParamMap.get(k) ?? '']),
      ),
    );
  else if (kind === 'board') request = api.board(route.paramMap.get('slug') ?? '');
  else request = api.hardware();
  return request.pipe(
    catchError((e: HttpErrorResponse) =>
      of({ error: e.status === 404 ? 'not-found' : 'unavailable' }),
    ),
  );
};
