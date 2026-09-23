import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { StatistikaService } from '../services/statistika.service';

Chart.register(...registerables);

const BOJE = ['#0d6efd', '#dc3545', '#198754', '#fd7e14', '#6f42c1', '#20c997', '#d63384', '#6c757d', '#ffc107', '#0dcaf0'];

@Component({
  selector: 'app-admin-statistika',
  imports: [RouterLink],
  templateUrl: './admin-statistika.html',
  styleUrl: './admin-statistika.css',
})
export class AdminStatistika implements AfterViewInit {
  statistikaService = inject(StatistikaService);

  @ViewChild('prometCanvas') prometCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('najnarucivanijiCanvas') najnarucivanijiCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('oceneCanvas') oceneCanvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    this.ucitajPromet();
    this.ucitajNajnarucivanije();
    this.ucitajOcene();
  }

  ucitajPromet() {
    this.statistikaService.promet().subscribe(rezultati => {
      new Chart(this.prometCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: rezultati.map(r => r.nazivStamparije || r.stamparijaId),
          datasets: [{
            label: 'Promet (din) u poslednja 3 meseca',
            data: rezultati.map(r => r.ukupno),
            backgroundColor: '#0d6efd'
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    });
  }

  ucitajNajnarucivanije() {
    this.statistikaService.najnarucivaniji().subscribe(rezultati => {
      new Chart(this.najnarucivanijiCanvas.nativeElement, {
        type: 'pie',
        data: {
          labels: rezultati.map(r => `${r.naziv} (${r.procenat}%)`),
          datasets: [{
            data: rezultati.map(r => r.kolicina),
            backgroundColor: rezultati.map((_, i) => BOJE[i % BOJE.length])
          }]
        },
        options: {
          responsive: true
        }
      });
    });
  }

  ucitajOcene() {
    this.statistikaService.ocene().subscribe(proizvodi => {
      let sviDatumi = [...new Set(proizvodi.flatMap(p => p.tacke.map(t => t.datum)))].sort();

      let datasets = proizvodi.map((p, i) => {
        let indeksTacke = 0;
        let poslednjaVrednost: number | null = null;

        let podaci = sviDatumi.map(datum => {
          while (indeksTacke < p.tacke.length && p.tacke[indeksTacke].datum <= datum) {
            poslednjaVrednost = p.tacke[indeksTacke].vrednost;
            indeksTacke++;
          }
          return poslednjaVrednost;
        });

        return {
          label: p.naziv,
          data: podaci,
          borderColor: BOJE[i % BOJE.length],
          backgroundColor: BOJE[i % BOJE.length],
          spanGaps: false,
          tension: 0.1
        };
      });

      new Chart(this.oceneCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: sviDatumi,
          datasets: datasets
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          },
          scales: { y: { title: { display: true, text: 'Kumulativna ocena (lajkovi - dislajkovi)' } } }
        }
      });
    });
  }
}
