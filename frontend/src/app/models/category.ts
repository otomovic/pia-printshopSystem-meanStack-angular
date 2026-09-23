export class SubcategoryType {
  naziv = ""
}

export class CategoryType {
  _id = ""
  naziv = ""
  potkategorije: SubcategoryType[] = []
}
