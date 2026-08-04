import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchResultCountText'
})
export class SearchResultCountTextPipe implements PipeTransform {

  transform(numberOfResults: number, args?: any): any {
    if (numberOfResults === 1) {
      return 'Result';
    } else if (numberOfResults > 1 || numberOfResults === 0) {
      return 'Results';
    } else {
      return null;
    }
  }

}
