import { BaseCriteria } from './base-criteria';

export class clientCriteria extends BaseCriteria {
  nameLike?: any;
  addressLike?: any;
  telephoneLike?: any;
  fixeLike?: any;
  villeId?: any;

  constructor() {
    super();
  }
}
