import { ligneVente } from './ligne_vente.model';
export class Role {
  id?: number;
  label?: string;
  name?: string;
  liste_permissions: any[] = [];

  constructor() {}
}
