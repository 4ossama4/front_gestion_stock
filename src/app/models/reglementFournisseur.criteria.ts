import { BaseCriteria } from './base-criteria';

export class ReglementFournisseursCriteria extends BaseCriteria {
  fournisseurId?: any;
  fournisseur?: any;

  dateStart?: any = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 1, 0, 0);
  dateEnd?: any = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 0);
  date?: any = [
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 1, 0, 0),
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 0),
  ];

  paymentMethodId?: any;
  paymentMethod?: any;
  constructor() {
    super();
  }
}
