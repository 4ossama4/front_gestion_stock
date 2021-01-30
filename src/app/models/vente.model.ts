import { ligneVente } from './ligne_vente.model';
export class Vente {
  id?: number;
  client_id?: number;
  commercial_id?: number;
  date?: any;
  payment_mode_id?: number;
  reference?: string;
  is_bl?: boolean;
  is_facture?: boolean;
  is_paid?: boolean;

  prix_vente_ttc?: number;
  prix_vente_ttc_with_remise?: number;
  prix_vente_ht?: number;
  commercial_total?: number;
  net_vente?: number;
  avance?: number;

  transport?: string;
  lignes_vente: ligneVente[] = [];

  constructor() {}
}
