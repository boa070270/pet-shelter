import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'plainHtml'
})
export class PlainHtmlPipe implements PipeTransform {

  transform(value: string, length?: number): string {
    if (!value) {
      return value;
    }
    const withoutHtml = value.replace(/<(?:.|\n)*?>/gm, ' ');
    if (length && length < withoutHtml.length) {
      return withoutHtml.substring(0, length) + ' ...';
    } else {
      return withoutHtml;
    }
  }

}
