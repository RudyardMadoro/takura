import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-media-library',
  template: `<h1 tabindex="-1">Media library</h1>
    <p>
      Only clean staff uploads with documented rights can be cleared. Private plans cannot be
      promoted through this screen.
    </p>
    <button type="button" (click)="refresh()">Refresh library</button>
    @if (error) {
      <p role="alert">{{ error }}</p>
    }
    <ul>
      @for (asset of assets; track asset.id) {
        <li>
          <strong>{{ asset.caption }}</strong> — {{ asset.scan_status }} /
          {{ asset.publication_clearance }} / {{ asset.rights_status }}
          <button
            type="button"
            (click)="clear(asset)"
            [disabled]="asset.publication_clearance !== 'PENDING'"
          >
            Clear derivative for publication
          </button>
        </li>
      }
    </ul>
    <h2>Register a clean staff upload</h2>
    <label
      >Upload image or reviewed MP4<input
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.mp4"
        (change)="upload($event)"
        [disabled]="uploading"
    /></label>
    <p aria-live="polite">{{ uploadStatus }}</p>
    <label>Attachment ID<input [(ngModel)]="attachmentId" /></label
    ><label
      >Stage<select [(ngModel)]="stage">
        <option>BEFORE</option>
        <option>DURING</option>
        <option>AFTER</option>
        <option>DETAIL</option>
        <option>CONCEPT</option>
      </select></label
    ><label>Caption<input [(ngModel)]="caption" maxlength="240" /></label
    ><label>Informative alt text<input [(ngModel)]="altText" maxlength="240" /></label
    ><label>Rights evidence<input [(ngModel)]="rightsReference" maxlength="240" /></label
    ><label>Video poster asset ID (video only)<input [(ngModel)]="posterAssetId" /></label
    ><label>Captions reference (video only)<input [(ngModel)]="captionsReference" /></label
    ><button type="button" (click)="register()">Register asset</button>`,
})
export class MediaLibraryPage {
  private readonly http = inject(HttpClient);
  assets: any[] = [];
  error = '';
  attachmentId = '';
  stage = 'CONCEPT';
  caption = '';
  altText = '';
  rightsReference = '';
  posterAssetId = '';
  captionsReference = '';
  uploading = false;
  uploadStatus = 'No media selected.';
  constructor() {
    this.refresh();
  }
  refresh() {
    this.http.get<any[]>('/api/v1/admin/media').subscribe({
      next: (value) => (this.assets = value),
      error: () => (this.error = 'The media library is unavailable.'),
    });
  }
  async upload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading = true;
    this.error = '';
    this.uploadStatus = 'Preparing secure upload…';
    try {
      const checksum = Array.from(
        new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer())),
      )
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const session: any = await firstValueFrom(
        this.http.post('/api/v1/admin/media/upload-sessions', {
          files: [
            {
              file_name: file.name,
              byte_size: file.size,
              content_type: file.type,
              checksum_sha256: checksum,
            },
          ],
        }),
      );
      const allocation = session.files[0];
      const form = new FormData();
      for (const [key, value] of Object.entries(allocation.upload.fields))
        form.append(key, String(value));
      form.append('file', file);
      const response = await fetch(allocation.upload.url, { method: 'POST', body: form });
      if (!response.ok) throw new Error('The storage service rejected the upload.');
      const completion: any = await firstValueFrom(
        this.http.post(
          `/api/v1/upload-sessions/${session.session_id}/files/${allocation.attachment_id}/complete`,
          {},
          { headers: new HttpHeaders({ 'X-Upload-Capability': session.capability }) },
        ),
      );
      if (completion.state === 'REJECTED') throw new Error('The media failed safety validation.');
      this.attachmentId = allocation.attachment_id;
      this.uploadStatus = `Upload ${completion.state.toLowerCase()}; register it after the scan reaches CLEAN.`;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'The upload failed.';
      this.uploadStatus = 'No usable media is selected.';
    } finally {
      this.uploading = false;
    }
  }
  register() {
    this.error = '';
    this.http
      .post('/api/v1/admin/media', {
        attachment_id: this.attachmentId,
        stage: this.stage,
        caption: this.caption,
        alt_text: this.altText,
        rights_reference: this.rightsReference,
        poster_asset_id: this.posterAssetId || null,
        captions_reference: this.captionsReference || null,
      })
      .subscribe({
        next: () => this.refresh(),
        error: (e) => (this.error = e.error?.message ?? 'The asset could not be registered.'),
      });
  }
  clear(asset: any) {
    this.http
      .post(
        `/api/v1/admin/media/${asset.id}/clearance`,
        {},
        { headers: new HttpHeaders({ 'If-Match': `"${asset.revision}"` }) },
      )
      .subscribe({
        next: () => this.refresh(),
        error: (e) => (this.error = e.error?.message ?? 'The asset could not be cleared.'),
      });
  }
}
