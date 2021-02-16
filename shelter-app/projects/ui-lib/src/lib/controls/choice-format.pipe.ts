import { Pipe, PipeTransform } from '@angular/core';
import {choiceFormat} from '../shared';

@Pipe({
  name: 'choiceFormat'
})
export class ChoiceFormatPipe implements PipeTransform {

  transform(value: string, ...args: any[]): string {
    return choiceFormat(value, args);
  }

}
