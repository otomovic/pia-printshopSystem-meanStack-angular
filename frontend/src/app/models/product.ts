export class UslugaStampeType {
  idUsluge = ""
  tipStampe = ""
  maxSirinaMm = 0
  maxVisinaMm = 0
  dodatnaCenaPoKomadu = 0
}

export class ProductType {
  naziv = ""
  opisDugacak = ""
  categoryName = ""
  jedinicnaCena = 0
  slikaUrl? = ""
  slikeDodatne?: string[] = []
  brojLajkova = 0
  brojDislajkova = 0
  printerName? = ""
  stamparijaId? = ""
  grad? = ""
  kolicinaNaLageru? = 0
  dostupneBoje?: string[] = ["Bela"]
  uslugeStampe?: UslugaStampeType[] = []
}

export interface ProductSearchParams {
  naziv?: string;
  kategorija?: string;
}
