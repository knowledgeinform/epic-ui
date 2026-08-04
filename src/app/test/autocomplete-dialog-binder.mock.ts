import { AutocompleteDialogBinder } from '@app/components/single-autocomplete-dialog/single-autocomplete-dialog.component';

export const autocompleteDialogBinderMock: AutocompleteDialogBinder<any> = {
  title: 'a',
  instructions: 'b',
  placeholder: 'c',
  autocompleteDisplay: (o: object) => '',
  autocompleteSource: (s: string) => null,
  validateSelection: (o: any) => null,
}
