import { BaseCriteria } from './base-criteria';

export class commercialCriteria extends BaseCriteria {
  nameLike?: any;
  addressLike?: any;
  telephoneLike?: any;
  fixeLike?: any;
  villeId?: any;

  constructor() {
    super();
  }
}
