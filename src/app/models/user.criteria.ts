import { BaseCriteria } from './base-criteria';

export class userCriteria extends BaseCriteria {
  nameLike?: any;
  telephoneLike?: any;
  fixeLike?: any;

  constructor() {
    super();
  }
}
