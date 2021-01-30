export class BaseCriteria {
  maxResults: number = 10;
  page: number = 1;
  sortField: string = 'id';
  sortOrder: string = 'desc';

  constructor() {}
}
