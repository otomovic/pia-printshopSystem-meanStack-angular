import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Admin } from './admin/admin';
import { LoginAdmin } from './loginAdmin/loginAdmin';
import { Home } from './home/home';
import { Product } from './product/product';
import { Client } from './client/client';
import { Priprema } from './priprema/priprema';
import { Korpa } from './korpa/korpa';
import { Stampar } from './stampar/stampar';
import { DodajProizvod } from './dodaj-proizvod/dodaj-proizvod';
import { ArhivaProizvoda } from './arhiva-proizvoda/arhiva-proizvoda';
import { AzuriranjeKolicina } from './azuriranje-kolicina/azuriranje-kolicina';
import { Narudzbine } from './narudzbine/narudzbine';
import { JavneNabavke } from './javne-nabavke/javne-nabavke';
import { Licitacije } from './licitacije/licitacije';
import { AdminKategorije } from './admin-kategorije/admin-kategorije';
import { AdminStatistika } from './admin-statistika/admin-statistika';

export const routes: Routes = [
  {path:"", component: Home},
  {path:"login", component:Login},
  {path:"register", component:Register},
  {path: "admin", component:Admin},
  {path: 'loginAdmin', component: LoginAdmin},
  {path: 'proizvod', component: Product},
  {path: 'client', component: Client},
  {path: 'priprema', component: Priprema},
  {path: 'korpa', component: Korpa},
  {path: 'stampar', component: Stampar},
  {path: 'stampar/proizvod', component: DodajProizvod},
  {path: 'arhiva', component: ArhivaProizvoda},
  {path: 'stampar/kolicine', component: AzuriranjeKolicina},
  {path: 'stampar/narudzbine', component: Narudzbine},
  {path: 'javne-nabavke', component: JavneNabavke},
  {path: 'stampar/licitacije', component: Licitacije},
  {path: 'admin/kategorije', component: AdminKategorije},
  {path: 'admin/statistika', component: AdminStatistika},
];
