import { Injectable } from '@angular/core';
import { AbstractSecurityStorage } from 'angular-auth-oidc-client';
@Injectable()
export class MemorySecurityStorage implements AbstractSecurityStorage {
  private readonly values = new Map<string, string>();
  read(k: string) {
    return this.values.get(k) ?? null;
  }
  write(k: string, v: string) {
    this.values.set(k, v);
  }
  remove(k: string) {
    this.values.delete(k);
  }
  clear() {
    this.values.clear();
  }
}
