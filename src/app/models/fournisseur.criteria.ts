import { BaseCriteria } from './base-criteria';

export class fournisseurCriteria extends BaseCriteria {
  nameLike?: any;
  addressLike?: any;
  telephoneLike?: any;
  fixeLike?: any;

  constructor() {
    super();
  }
}
