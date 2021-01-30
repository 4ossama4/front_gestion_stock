import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'priceFormat' })
export class PriceFormat implements PipeTransform {
  constructor() {}

  transform(value: number): string {
    var number = value;
    var priceFormat = new Intl.NumberFormat().format(number);

    return priceFormat;
  }
}
