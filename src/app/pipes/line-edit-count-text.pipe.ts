import {Pipe, PipeTransform} from '@angular/core';
import {CommentType} from '@app/interfaces/comment-type.dto';

@Pipe({
  name: 'lineEditCountText'
})
export class LineEditCountTextPipe implements PipeTransform {

  transform(count: number, commentType?: CommentType): any {
    if (commentType === CommentType.RED_LINE_COMMENT) {
      if (!count) {
        return 'There are no red lines.';
      } else {
        return count === 1 ? 'There is 1 red line.' : 'There are ' + count + ' red lines.';
      }
    } else if (commentType === CommentType.BLACK_LINE_COMMENT) {
      if (!count) {
        return 'There are no black lines.';
      } else {
        return count === 1 ? 'There is 1 black line.' : 'There are ' + count + ' black lines.';
      }
    } else if (commentType === CommentType.RUN_CLOSEOUT_STICKY_COMMENT) {
      if (!count) {
        return 'There are no run closeout stickies';
      } else {
        return count === 1 ? 'There is 1 closeout sticky' : 'There are ' + count + ' closeout stickies';
      }
    } else {
      return null;
    }
  }

}
