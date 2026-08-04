import {Pipe, PipeTransform} from '@angular/core';
import {CommentType} from '@app/interfaces/comment-type.dto';

@Pipe({
  name: 'lineEditTypeText'
})
export class LineEditTypeTextPipe implements PipeTransform {

  transform(commentType: CommentType, args?: any): any {
    if (commentType === CommentType.BLACK_LINE_COMMENT) {
      return 'Black';
    } else if (commentType === CommentType.RED_LINE_COMMENT) {
      return 'Red';
    }
  }

}
