import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class JavnaNabavkaService {
  private http = inject(HttpClient);
  private base = 'http://localhost:4000/nabavke';

  kreiraj(username: string, items: any[]) {
    return this.http.post<{ message: string, javnaNabavkaId?: string }>(this.base, { username, items });
  }

  moje(username: string) {
    return this.http.get<any[]>(`${this.base}/moje`, { params: { username } });
  }

  otvorene(stamparijaId: string) {
    return this.http.get<any[]>(`${this.base}/otvorene`, { params: { stamparijaId } });
  }

  posaljiPonudu(stamparijaId: string, javnaNabavkaId: string, stavke: any[]) {
    return this.http.post<{ message: string }>(`${this.base}/ponuda`, { stamparijaId, javnaNabavkaId, stavke });
  }

  mojePonude(stamparijaId: string) {
    return this.http.get<any[]>(`${this.base}/mojePonude`, { params: { stamparijaId } });
  }
}
