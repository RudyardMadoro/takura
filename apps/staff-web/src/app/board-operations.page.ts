import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  standalone: true,
  imports: [FormsModule, DatePipe],
  selector: 'app-board-operations',
  template: `<h1 tabindex="-1">Lead operations</h1>
    <p>Every count, list, detail and action is restricted by server-side scope.</p>
    @if (dashboard()) {
      <div class="queue-grid" aria-label="Scoped queue counts">
        <button
          (click)="filter.overdue = false; filter.unassigned = false; filter.state = 'NEW'; load()"
        >
          New {{ dashboard().new_count }}
        </button>
        <button (click)="filter.state = ''; filter.unassigned = true; load()">
          Unassigned {{ dashboard().unassigned_count }}
        </button>
        <button
          (click)="filter.state = ''; filter.unassigned = false; filter.overdue = true; load()"
        >
          Overdue {{ dashboard().overdue_count }}
        </button>
        <span>Scan review {{ dashboard().scan_backlog_count }}</span
        ><span>Quote queue {{ dashboard().quote_queue_count }}</span>
      </div>
    }
    <form (ngSubmit)="load()" class="filters" aria-label="Lead filters">
      <label
        >State
        <select name="state" [(ngModel)]="filter.state">
          <option value="">All</option>
          <option>NEW</option>
          <option>CONTACTED</option>
          <option>AWAITING_INFORMATION</option>
          <option>ASSESSMENT_SCHEDULED</option>
          <option>ASSESSMENT_COMPLETE</option>
          <option>QUOTE_IN_PREPARATION</option>
          <option>QUOTE_SENT</option>
          <option>WON</option>
          <option>LOST</option>
          <option>CLOSED</option>
          <option>SPAM</option>
        </select></label
      >
      <label
        >Team
        <select name="team" [(ngModel)]="filter.team">
          <option value="">All</option>
          <option>PROPERTY</option>
          <option>CABINETRY</option>
          <option>BOARDS</option>
          <option>GENERAL</option>
        </select></label
      >
      <label>Area <input name="area" [(ngModel)]="filter.area" /></label>
      <label
        ><input type="checkbox" name="unassigned" [(ngModel)]="filter.unassigned" />
        Unassigned</label
      >
      <label><input type="checkbox" name="overdue" [(ngModel)]="filter.overdue" /> Overdue</label>
      <button type="submit">Apply filters</button
      ><button type="button" (click)="reset()">Reset</button>
    </form>
    @if (error()) {
      <p role="alert">{{ error() }}</p>
    }
    <p aria-live="polite">Visible requests: {{ items().length }}</p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>State</th>
            <th>Team</th>
            <th>Area</th>
            <th>Due</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          @for (item of items(); track item.id) {
            <tr>
              <td>{{ item.reference }}</td>
              <td>{{ item.state }}</td>
              <td>{{ item.team_code }}</td>
              <td>{{ item.area }}</td>
              <td>{{ item.first_response_due_at | date: 'medium' }}</td>
              <td>
                <button (click)="detail(item.id)">Review {{ item.reference }}</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    @if (nextCursor()) {
      <button (click)="loadMore()">Load more</button>
    }
    @if (selected()) {
      <section>
        <h2>{{ selected().enquiry.reference }}</h2>
        <p>Status {{ selected().enquiry.state }} · revision {{ selected().enquiry.revision }}</p>
        <p>{{ selected().enquiry.full_name }} · {{ selected().enquiry.preferred_contact }}</p>
        <p>{{ selected().enquiry.area }}, {{ selected().enquiry.country_code }}</p>
        <p>{{ selected().enquiry.description }}</p>
        <div class="actions" aria-label="Lead commands">
          <button (click)="openCommand('activity')">Record human activity</button>
          <button (click)="openCommand('task')">Create follow-up task</button>
          <button (click)="openCommand('assessment')">Schedule assessment</button>
          <button (click)="openCommand('assignment')">Change assignment</button>
        </div>
        <div class="actions">
          <label
            >Next state
            <select [(ngModel)]="nextState">
              <option>CONTACTED</option>
              <option>AWAITING_INFORMATION</option>
              <option>ASSESSMENT_SCHEDULED</option>
              <option>ASSESSMENT_COMPLETE</option>
              <option>QUOTE_IN_PREPARATION</option>
              <option>QUOTE_SENT</option>
              <option>WON</option>
              <option>LOST</option>
              <option>CLOSED</option>
              <option>SPAM</option>
            </select></label
          ><label>Reason <input [(ngModel)]="reason" /></label
          ><button (click)="transition()">Apply guarded transition</button>
        </div>
        <h3>Activity</h3>
        <ul>
          @for (a of selected().activities; track a.id) {
            <li>{{ a.occurred_at | date: 'medium' }} · {{ a.type }} · {{ a.outcome }}</li>
          }
        </ul>
        <h3>Tasks</h3>
        <ul>
          @for (t of selected().tasks; track t.id) {
            <li>{{ t.purpose }} · {{ t.state }} · due {{ t.due_at | date: 'medium' }}</li>
          }
        </ul>
        <h3>Assessments</h3>
        <ul>
          @for (a of selected().assessments; track a.id) {
            <li>{{ a.state }} · {{ a.starts_at | date: 'medium' }} · {{ a.mode }}</li>
          }
        </ul>
      </section>
    }
    <dialog #commandDialog aria-labelledby="command-title" (close)="commandError.set('')">
      <form (ngSubmit)="submitCommand()">
        <h2 id="command-title">{{ commandTitle() }}</h2>
        <p>Changes are checked against the latest record revision and your server-side grants.</p>
        @if (commandError()) {
          <p role="alert" tabindex="-1">{{ commandError() }}</p>
        }
        @if (commandType() === 'activity') {
          <label
            >Channel
            <select name="channel" [(ngModel)]="command.channel">
              <option>CALL</option>
              <option>EMAIL</option>
              <option>WHATSAPP</option>
              <option>IN_PERSON</option>
              <option>REMOTE</option>
            </select></label
          >
          <label
            >Outcome
            <select name="outcome" [(ngModel)]="command.outcome">
              <option>COMPLETED</option>
              <option>FAILED</option>
            </select></label
          >
          <label
            >Evidence note
            <textarea name="activity-note" maxlength="1000" [(ngModel)]="command.note"></textarea>
          </label>
        }
        @if (commandType() === 'task') {
          <label
            >Owner identity <input name="task-owner" required [(ngModel)]="command.owner"
          /></label>
          <label
            >Purpose <input name="purpose" required maxlength="120" [(ngModel)]="command.purpose"
          /></label>
          <label
            >Due time <input name="due" required type="datetime-local" [(ngModel)]="command.due"
          /></label>
        }
        @if (commandType() === 'assessment') {
          <label
            >Assigned staff identity <input name="assignee" required [(ngModel)]="command.owner"
          /></label>
          <label
            >State
            <select name="assessment-state" [(ngModel)]="command.assessmentState">
              <option>PROPOSED</option>
              <option>CONFIRMED</option>
            </select></label
          >
          <label
            >Starts
            <input name="starts" required type="datetime-local" [(ngModel)]="command.starts"
          /></label>
          <label
            >Ends <input name="ends" required type="datetime-local" [(ngModel)]="command.ends"
          /></label>
          <label
            >Mode
            <select name="mode" [(ngModel)]="command.mode">
              <option>REMOTE</option>
              <option>PRIVATE_LOCATION</option>
            </select></label
          >
          @if (command.mode === 'PRIVATE_LOCATION') {
            <label
              >Private location
              <input
                name="location"
                required
                maxlength="500"
                [(ngModel)]="command.location" /></label
            ><label
              ><input name="access" type="checkbox" [(ngModel)]="command.access" /> Property-access
              authorisation is recorded</label
            >
          }
        }
        @if (commandType() === 'assignment') {
          <label
            >Team
            <select name="assign-team" [(ngModel)]="command.team">
              <option>PROPERTY</option>
              <option>CABINETRY</option>
              <option>BOARDS</option>
              <option>GENERAL</option>
            </select></label
          >
          <label>Owner identity <input name="assign-owner" [(ngModel)]="command.owner" /></label>
          <label
            >Collaborator identities
            <input
              name="collaborators"
              [(ngModel)]="command.collaborators"
              aria-describedby="collaborator-help" /></label
          ><small id="collaborator-help">Comma-separated approved staff UUIDs.</small>
        }
        <div class="dialog-actions">
          <button type="button" (click)="closeCommand()">Cancel</button
          ><button type="submit">{{ commandSubmitLabel() }}</button>
        </div>
      </form>
    </dialog>`,
  styles: [
    `
      :host {
        display: block;
        max-width: 90rem;
        margin: auto;
        padding: 1rem;
      }
      .queue-grid,
      .filters,
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: end;
        margin: 1rem 0;
      }
      .queue-grid > * {
        padding: 0.75rem;
      }
      .filters label,
      .actions label {
        display: grid;
        gap: 0.25rem;
      }
      .table-wrap {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        text-align: left;
        padding: 0.65rem;
        border-bottom: 1px solid #bbb;
      }
      button,
      input,
      select,
      textarea {
        font: inherit;
        min-height: 2.75rem;
      }
      section {
        margin-top: 1.5rem;
        border-top: 2px solid;
        padding-top: 1rem;
      }
      dialog {
        width: min(38rem, calc(100% - 2rem));
        max-height: calc(100dvh - 2rem);
        overflow: auto;
        padding: 1.25rem;
        border: 2px solid;
        border-radius: 0.25rem;
      }
      dialog::backdrop {
        background: rgb(0 0 0 / 0.55);
      }
      dialog form,
      dialog label {
        display: grid;
        gap: 0.35rem;
      }
      dialog form {
        gap: 1rem;
      }
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        position: sticky;
        bottom: 0;
        background: white;
        padding-top: 0.75rem;
      }
      @media (max-width: 600px) {
        th:nth-child(3),
        td:nth-child(3),
        th:nth-child(5),
        td:nth-child(5) {
          display: none;
        }
        .filters > * {
          flex: 1 1 100%;
        }
      }
    `,
  ],
})
export class BoardInboxPage {
  @ViewChild('commandDialog') commandDialog?: ElementRef<HTMLDialogElement>;
  private readonly http = inject(HttpClient);
  readonly items = signal<any[]>([]);
  readonly selected = signal<any>(null);
  readonly dashboard = signal<any>(null);
  readonly nextCursor = signal<string | null>(null);
  readonly error = signal('');
  readonly commandError = signal('');
  readonly commandType = signal<'activity' | 'task' | 'assessment' | 'assignment'>('activity');
  filter = { state: '', team: '', area: '', unassigned: false, overdue: false };
  nextState = 'CONTACTED';
  reason = '';
  command = {
    channel: 'CALL',
    outcome: 'COMPLETED',
    note: '',
    owner: '',
    purpose: '',
    due: '',
    assessmentState: 'PROPOSED',
    starts: '',
    ends: '',
    mode: 'REMOTE',
    location: '',
    access: false,
    team: 'BOARDS',
    collaborators: '',
  };
  constructor() {
    this.load();
  }
  load() {
    const p = new URLSearchParams();
    Object.entries(this.filter).forEach(([k, v]) => {
      if (v) p.set(k, String(v));
    });
    this.http.get<any>('/api/v1/admin/enquiries?' + p).subscribe({
      next: (r) => {
        this.items.set(r.items);
        this.nextCursor.set(r.next_cursor);
      },
      error: () => this.error.set('Inbox is unavailable or outside your scope.'),
    });
    this.http.get<any>('/api/v1/admin/dashboard').subscribe({ next: (r) => this.dashboard.set(r) });
  }
  detail(id: string) {
    this.http.get<any>('/api/v1/admin/enquiries/' + id).subscribe({
      next: (r) => this.selected.set(r),
      error: () => this.error.set('That record is unavailable or outside your scope.'),
    });
  }
  reset() {
    this.filter = { state: '', team: '', area: '', unassigned: false, overdue: false };
    this.load();
  }
  loadMore() {
    const cursor = this.nextCursor();
    if (!cursor) return;
    this.http.get<any>('/api/v1/admin/enquiries?cursor=' + cursor).subscribe((r) => {
      this.items.update((v) => [...v, ...r.items]);
      this.nextCursor.set(r.next_cursor);
    });
  }
  transition() {
    const s = this.selected();
    if (!s) return;
    this.http
      .post(
        '/api/v1/admin/enquiries/' + s.enquiry.id + '/transition',
        { next_state: this.nextState, reason: this.reason || null, evidence_reference: null },
        { headers: new HttpHeaders({ 'If-Match': `"${s.enquiry.revision}"` }) },
      )
      .subscribe({
        next: () => this.detail(s.enquiry.id),
        error: (e) =>
          this.error.set(
            e.status === 412
              ? 'This lead changed. Refresh it, review the update and reapply intentionally.'
              : 'The transition was rejected because its evidence or permission guard was not satisfied.',
          ),
      });
  }
  openCommand(type: 'activity' | 'task' | 'assessment' | 'assignment') {
    this.commandType.set(type);
    this.commandError.set('');
    this.commandDialog?.nativeElement.showModal();
  }
  closeCommand() {
    this.commandDialog?.nativeElement.close();
  }
  commandTitle() {
    return (
      {
        activity: 'Record human activity',
        task: 'Create follow-up task',
        assessment: 'Schedule assessment',
        assignment: 'Change assignment',
      } as const
    )[this.commandType()];
  }
  commandSubmitLabel() {
    return (
      {
        activity: 'Record activity',
        task: 'Create task',
        assessment: 'Save assessment',
        assignment: 'Save assignment',
      } as const
    )[this.commandType()];
  }
  submitCommand() {
    const selected = this.selected();
    if (!selected) return;
    const base = '/api/v1/admin/enquiries/' + selected.enquiry.id;
    const headers = new HttpHeaders({ 'If-Match': `"${selected.enquiry.revision}"` });
    let request;
    if (this.commandType() === 'activity')
      request = this.http.post(
        base + '/activities',
        {
          type: this.command.outcome === 'COMPLETED' ? 'HUMAN_CONTACT' : 'CONTACT_ATTEMPT',
          outcome: this.command.outcome,
          channel: this.command.channel,
          note: this.command.note || null,
        },
        { headers },
      );
    else if (this.commandType() === 'task')
      request = this.http.post(base + '/tasks', {
        owner: this.command.owner,
        purpose: this.command.purpose,
        due_at: new Date(this.command.due).toISOString(),
      });
    else if (this.commandType() === 'assessment')
      request = this.http.post(base + '/assessments', {
        assignee: this.command.owner,
        state: this.command.assessmentState,
        starts_at: new Date(this.command.starts).toISOString(),
        ends_at: new Date(this.command.ends).toISOString(),
        mode: this.command.mode,
        private_location: this.command.mode === 'PRIVATE_LOCATION' ? this.command.location : null,
        private_notes: null,
        access_authorisation_confirmed: this.command.access,
        override_conflict: false,
        override_reason: null,
      });
    else
      request = this.http.post(
        base + '/assignment',
        {
          owner: this.command.owner || null,
          team: this.command.team,
          collaborators: this.command.collaborators
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
        },
        { headers },
      );
    request.subscribe({
      next: () => {
        this.closeCommand();
        this.detail(selected.enquiry.id);
      },
      error: (e) =>
        this.commandError.set(
          e.status === 412
            ? 'This lead changed. Close, refresh and reapply the command intentionally.'
            : 'The command was rejected. Check the fields, permissions and evidence requirements.',
        ),
    });
  }
}
@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-catalogue-admin',
  template: `<h1 tabindex="-1">Board catalogue management</h1>
    <p>
      Published specification revisions are immutable. Prices and stock counts are not collected.
    </p>
    <button (click)="load()">Refresh</button>
    @if (error()) {
      <p role="alert">{{ error() }}</p>
    }
    @for (v of variants(); track v.id) {
      <article>
        <h2>{{ v.name }} · {{ v.sku }}</h2>
        <p>
          {{ v.material_type }} {{ v.finish }} {{ v.thickness_mm }} mm · revision {{ v.revision }}
        </p>
        <p>{{ v.enabled ? 'Published' : 'Disabled' }}{{ v.archived ? ' · archived' : '' }}</p>
        <button (click)="archive(v)">Archive</button>
      </article>
    }`,
})
export class CatalogueAdminPage {
  private readonly http = inject(HttpClient);
  readonly variants = signal<any[]>([]);
  readonly error = signal('');
  constructor() {
    this.load();
  }
  load() {
    this.http.get<any[]>('/api/v1/admin/catalogue/variants').subscribe({
      next: (r) => this.variants.set(r),
      error: () => this.error.set('Catalogue access is not granted.'),
    });
  }
  archive(v: any) {
    this.http
      .delete('/api/v1/admin/catalogue/variants/' + v.id, {
        headers: new HttpHeaders({ 'If-Match': `"${v.revision}"` }),
      })
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set('The item changed; refresh before retrying.'),
      });
  }
}
