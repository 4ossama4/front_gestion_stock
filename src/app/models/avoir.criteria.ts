import { BaseCriteria } from './base-criteria';

export class avoirCriteria extends BaseCriteria {
  clientId?: any;
  client?: any;
  dateStart?: any = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 1, 0, 0);
  dateEnd?: any = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 0);
  date?: any = [
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 1, 0, 0),
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 0),
  ];

  referenceLike?: any;
  commercialeId?: any;

  constructor() {
    super();
  }
}
