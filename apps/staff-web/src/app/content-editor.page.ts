import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { StaffSessionService } from './auth/staff-session.service';

interface ContentRow {
  id: string;
  content_type: 'PAGE' | 'SERVICE' | 'PROJECT' | 'POLICY' | 'FAQ';
  slug: string;
  state: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  current_revision: number;
  published_revision: number | null;
  featured: boolean;
  category_code: string | null;
}
interface ContentEditor extends ContentRow {
  title: string;
  summary: string;
  body_html: string;
  metadata_json: string;
}

@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-content-editor',
  template: `
    <h1 tabindex="-1">Editorial content</h1>
    <p>Create drafts and preserve immutable revisions. Publishing is a separate permission.</p>
    @if (message) {
      <p role="status">{{ message }}</p>
    }
    @if (error) {
      <p role="alert">{{ error }}</p>
    }
    <div class="editor-layout">
      <section aria-labelledby="entries-title">
        <h2 id="entries-title">Entries</h2>
        <button type="button" (click)="newDraft()">New draft</button>
        <ul>
          @for (row of rows; track row.id) {
            <li>
              <button type="button" (click)="select(row.id)">
                {{ row.content_type }} · {{ row.slug }} · {{ row.state }}
              </button>
            </li>
          }
        </ul>
      </section>
      <form (ngSubmit)="save(false)" aria-labelledby="editor-title">
        <h2 id="editor-title">{{ selectedId ? 'Edit revision' : 'New draft' }}</h2>
        <label
          >Type
          <select name="contentType" [(ngModel)]="model.content_type" [disabled]="!!selectedId">
            <option>PAGE</option>
            <option>SERVICE</option>
            <option>PROJECT</option>
            <option>POLICY</option>
            <option>FAQ</option>
          </select></label
        >
        <label
          >Slug
          <input
            name="slug"
            [(ngModel)]="model.slug"
            required
            minlength="3"
            maxlength="100"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
        /></label>
        <label
          >Title <input name="title" [(ngModel)]="model.title" required maxlength="160"
        /></label>
        <label
          >Summary
          <textarea name="summary" [(ngModel)]="model.summary" required maxlength="320"></textarea>
        </label>
        <label
          >Structured body HTML
          <textarea name="body" [(ngModel)]="model.body_html" required rows="10"></textarea>
        </label>
        <label
          >Metadata JSON
          <textarea name="metadata" [(ngModel)]="model.metadata_json" required rows="5"></textarea>
        </label>
        <label>Category <input name="category" [(ngModel)]="model.category_code" /></label>
        <label
          ><input type="checkbox" name="featured" [(ngModel)]="model.featured" /> Featured</label
        >
        <div>
          <button type="submit">Save draft revision</button>
          @if (selectedId && canPublish) {
            <button type="button" (click)="save(true)">Publish revision</button
            ><button type="button" (click)="archive()">Archive</button>
          }
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .editor-layout {
        display: grid;
        grid-template-columns: minmax(15rem, 22rem) minmax(0, 45rem);
        gap: 2rem;
      }
      form,
      label {
        display: grid;
        gap: 0.35rem;
      }
      form {
        gap: 1rem;
      }
      input,
      textarea,
      select,
      button {
        font: inherit;
        min-height: 44px;
      }
      textarea {
        padding: 0.6rem;
      }
      @media (max-width: 800px) {
        .editor-layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ContentEditorPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly session = inject(StaffSessionService);
  rows: ContentRow[] = [];
  selectedId: string | null = null;
  message = '';
  error = '';
  model = this.empty();
  get canPublish() {
    return this.session.operations().has('content:publish');
  }
  ngOnInit() {
    void this.reload();
  }
  async reload() {
    this.rows = await firstValueFrom(this.http.get<ContentRow[]>('/api/v1/admin/content'));
  }
  async select(id: string) {
    this.selectedId = id;
    this.model = await firstValueFrom(this.http.get<ContentEditor>(`/api/v1/admin/content/${id}`));
    this.error = '';
  }
  newDraft() {
    this.selectedId = null;
    this.model = this.empty();
    this.error = '';
  }
  async save(publish: boolean) {
    this.error = '';
    this.message = '';
    try {
      if (!this.selectedId) {
        const created = await firstValueFrom(
          this.http.post<ContentRow>('/api/v1/admin/content', {
            content_type: this.model.content_type,
            featured: this.model.featured,
            category_code: this.model.category_code || null,
            draft: this.draft(),
          }),
        );
        await this.select(created.id);
        this.message = 'Draft created.';
      } else {
        const headers = new HttpHeaders({ 'If-Match': `"${this.model.current_revision}"` });
        await firstValueFrom(
          this.http.put(
            `/api/v1/admin/content/${this.selectedId}?publish=${publish}`,
            this.draft(),
            { headers },
          ),
        );
        await this.select(this.selectedId);
        this.message = publish
          ? 'Published revision is now visible within the 60-second cache window.'
          : 'Draft revision saved.';
      }
      await this.reload();
    } catch (failure) {
      this.error = this.describe(failure);
    }
  }
  async archive() {
    if (!this.selectedId) return;
    try {
      await firstValueFrom(
        this.http.delete(`/api/v1/admin/content/${this.selectedId}`, {
          headers: new HttpHeaders({ 'If-Match': `"${this.model.current_revision}"` }),
        }),
      );
      this.message = 'Content archived.';
      await this.reload();
      await this.select(this.selectedId);
    } catch (failure) {
      this.error = this.describe(failure);
    }
  }
  private draft() {
    return {
      slug: this.model.slug,
      title: this.model.title,
      summary: this.model.summary,
      body_html: this.model.body_html,
      metadata_json: this.model.metadata_json,
    };
  }
  private describe(failure: unknown) {
    const status = failure instanceof HttpErrorResponse ? failure.status : 0;
    return status === 412
      ? 'This entry changed elsewhere. Reload it before saving.'
      : status === 422
        ? 'Publication is blocked by media clearance.'
        : 'The editorial change could not be saved.';
  }
  private empty(): ContentEditor {
    return {
      id: '',
      content_type: 'PAGE',
      slug: '',
      state: 'DRAFT',
      current_revision: 0,
      published_revision: null,
      featured: false,
      category_code: null,
      title: '',
      summary: '',
      body_html: '<p></p>',
      metadata_json: '{}',
    };
  }
}
