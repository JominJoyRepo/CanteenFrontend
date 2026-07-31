import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface AppConfig {
  apiUrl: string;
}

const DEFAULT_CONFIG: AppConfig = {
  apiUrl: 'http://localhost:3000/api'
};

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: AppConfig = DEFAULT_CONFIG;

  constructor(private http: HttpClient) {}

  get apiUrl(): string {
    return this.config.apiUrl;
  }

  load(): Promise<void> {
    return firstValueFrom(this.http.get<AppConfig>('assets/env.json'))
      .then(cfg => {
        if (cfg?.apiUrl) {
          this.config = cfg;
        }
      })
      .catch(() => {
        this.config = DEFAULT_CONFIG;
      });
  }
}
