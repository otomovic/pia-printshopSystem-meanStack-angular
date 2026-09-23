export class PrometStamparijeType {
  stamparijaId = ""
  nazivStamparije = ""
  ukupno = 0
}

export class NajnarucivanijiProizvodType {
  naziv = ""
  kolicina = 0
  procenat = 0
}

export class OcenaTackaType {
  datum = ""
  vrednost = 0
}

export class OcenaProizvodaType {
  productId = ""
  naziv = ""
  tacke: OcenaTackaType[] = []
}
