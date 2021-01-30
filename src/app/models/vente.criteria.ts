import { BaseCriteria } from './base-criteria';

export class venteCriteria extends BaseCriteria {
  referenceLike?: any;
  clientId?: any;
  client?: any;
  createdById?: any;
  dateStart?: any = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 1, 0, 0);
  dateEnd?: any = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 0);
  date?: any = [
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 1, 0, 0),
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 0),
  ];
  paymentMethodId?: any;
  isBL?: any;
  commercialeId: any;
  commerciale: any;
  isAvoir?: boolean = false;
  constructor() {
    super();
  }
}
