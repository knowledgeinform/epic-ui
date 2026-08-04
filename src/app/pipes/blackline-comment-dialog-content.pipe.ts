import { A } from '@angular/cdk/keycodes';
import { Pipe, PipeTransform } from '@angular/core';
import { StepDef } from '@app/interfaces/step-def.interface';

@Pipe({
  name: 'blacklineCommentDialogContent'
})
export class BlacklineCommentDialogContentPipe implements PipeTransform {

  transform(data: StepDef[], p:string): string {
    if ( data.length == 1 ) {

      switch(p) {
        
        case 'title':
          return 'Manually Mark Step As Done'; 
        case 'p1': 
          return 'You are choosing to manually mark this step as done, even if a value has not been recorded for this step ' +
                  'If this is not your intention, please click "Cancel."'; 
        case 'p2': 
          return  'If you wish to proceed, click the checkbox to indicate you are manually marking the step as done, and enter '+
                  'a black line comment. You MUST enter a comment and click the box in order to proceed.'; 
        case 'p3': 
          return 'This step was previously manually marked as done. You are choosing to remove this manual action.'; 
        case 'p4': 
          return 'If you wish to proceed, click the checkbox to indicate you are removing the manual completion, and enter a black line comment. '+
                  'You MUST enter a comment and click the box in order to proceed.';
        case 'p5': 
          return 'Yes, mark this step as done.'; 
        case 'p6': 
          return 'Yes, remove the manual completion of this step.'; 
        case 'p7':
          return 'Mark Step As Done and Submit Black Line'; 
        default:
          return ''; 
      }
    } 
    else if(data.length > 1 ) {
      switch(p) {
        case 'title':
          return '[BULK] Manually Mark Selected Steps As Done'; 
        case 'p1': 
          return 'You are choosing to manually mark all the selected steps as done, even if a value has not been recorded for these steps ' +
                  'If this is not your intention, please click "Cancel."'; 
        case 'p2': 
          return  'If you wish to proceed, click the checkbox to indicate you are manually marking all the selected steps as done, and enter '+
                  'a black line comment. You MUST enter a comment and click the box in order to proceed.'; 
        case 'p3': 
          return 'The selected steps were previously manually marked as done. You are choosing to remove this manual action.'; 
        case 'p4': 
          return 'If you wish to proceed, click the checkbox to indicate you are removing the manual completion, and enter a black line comment. '+
                  'You MUST enter a comment and click the box in order to proceed.';
        case 'p5': 
          return '[BULK] Yes, mark the steps as done.'; 
        case 'p6': 
          return 'Yes, remove the manual completion of the steps.'; 
        case 'p7':
          return 'Mark Steps As Done and Submit Black Line'; 
        default:
          return ''; 
      }
    }
    else {
      return ''; 
    }
   
  }
}
