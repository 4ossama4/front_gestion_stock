import { BaseCriteria } from './base-criteria';

export class articleCriteria extends BaseCriteria {
  referencesIds?: any;
  referencesLike: any;
  referenceLike?: any;
  sous_familleId?: any;
  sous_famille?: any;
  marqueIds?: any;
  designationLike?: any;
  prixUniteMin?: number;
  prixUniteMax?: number;
  quantiteMin?: number;
  quantiteMax?: number;
  rayonLike?: string;
  fournisseurId?: any;
  familleId?: any;
  famille?: any;
  refOrgAndreferenceLike?: any;
  referenceNotSpaceLike?: any;
  constructor() {
    super();
  }
}
