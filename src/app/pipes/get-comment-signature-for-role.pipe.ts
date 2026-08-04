import { Pipe, PipeTransform } from '@angular/core';
import { RedBlackLineComment } from '@app/interfaces/comment.dto';
import { ProgramRoleDTO } from '@app/interfaces/program-role.dto';
import { BlackRedLineSignature } from '@app/interfaces/second-signature.dto';
import * as _ from 'lodash';

@Pipe({
  name: 'getCommentSignatureForRole',
  pure: false,
})
export class GetCommentSignatureForRolePipe implements PipeTransform {

  transform(role: ProgramRoleDTO, comment: RedBlackLineComment): BlackRedLineSignature {
    if (_.some([role, comment], _.isNil)) return;
    return _.find(comment.blackRedLineSignatures, signature => {
      if (!signature) return false;
      return signature.programRole && signature.programRole.pk == role.pk
    }
    );
  }

}
