import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { JavnaNabavkaService } from '../services/javna-nabavka.service';

@Component({
  selector: 'app-javne-nabavke',
  imports: [RouterLink],
  templateUrl: './javne-nabavke.html',
  styleUrl: './javne-nabavke.css',
})
export class JavneNabavke implements OnInit {
  private javnaNabavkaService = inject(JavnaNabavkaService);
  private router = inject(Router);

  username = '';
  nabavke: any[] = [];

  ngOnInit() {
    const stored = localStorage.getItem('loggedUser');
    if (!stored) {
      this.router.navigate(['login']);
      return;
    }

    const user = JSON.parse(stored);
    if (user.type !== 'pravnoLice') {
      this.router.navigate(['client']);
      return;
    }

    this.username = user.username;
    this.load();
  }

  load() {
    this.javnaNabavkaService.moje(this.username).subscribe(nabavke => {
      this.nabavke = nabavke;
    });
  }

  pdfUrl(nabavka: any): string {
    return 'http://localhost:4000/uploads/' + nabavka.pdfPath;
  }
}
