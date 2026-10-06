import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { EPICWSService } from '@app/services/epic-ws.service';
import { BlackLineDto, BlackLineEntityType } from '@app/interfaces/black-line.dto';
import { LineEditService } from '@app/services/line-edit.service';
import { LineEditStateService } from '@app/services/line-edit-state.service';
import { LoggerService } from '@app/services/logger.service';
import { MessageService } from '@app/services/message.service';
import { RunEditDTO, RunEditResult } from '@app/interfaces/run-edit.dto';

/**
 * Service for run metadata edits (name and description).
 * Handles dual persistence: database update + blackline comment.
 *
 * Note: Editability checks (canEditName, canEditDescription) are implemented
 * as pure pipes (CanEditRunNamePipe, CanEditRunDescriptionPipe) to follow the
 * existing architectural pattern. This service handles only the save mutation logic.
 */
@Injectable({
  providedIn: 'root'
})
export class RunEditService {

  constructor(
    private epicWs: EPICWSService,
    private lineEditService: LineEditService,
    private lineEditStateService: LineEditStateService,
    private loggerService: LoggerService,
    private messageService: MessageService
  ) {}

  /**
   * Save run metadata edit with dual persistence:
   * 1. Database update (name/description + History entry)
   * 2. Blackline comment creation (comment + change type + sign-off)
   */
  saveEdit(
    runPk: number,
    name: string,
    description: string,
    blackLineDto: BlackLineDto
  ): Observable<RunEditResult> {
    // Step 1: Update run metadata in database
    const runEditDTO: RunEditDTO = { runPk, name, description };

    return this.epicWs.updateRunMetadata(runEditDTO).pipe(
      switchMap((updateResult) => {
        if (!updateResult.success) {
          const errorMsg = updateResult.message || 'Failed to update run metadata';
          this.loggerService.error(errorMsg);
          return of(updateResult as RunEditResult & { errorMessage?: string });
        }

        // Store the backend's specific success message for later display
        const successMessage = updateResult.message || 'Run metadata updated successfully.';

        // Step 2: Create blackline comment
        this.loggerService.info('Creating blackline comment for run metadata edit');

        // Enrich the blackline with procedureDetails from the updated run
        const enrichedBlackLine: BlackLineDto = {
          ...blackLineDto,
          procedureDetails: {
            pk: updateResult.run.procedureDetails.pk
          } as any
        };

        return this.epicWs.saveNewBlackLines(
          [enrichedBlackLine],
          BlackLineEntityType.PROCEDURE_DETAILS,
          false
        ).pipe(
          switchMap((savedBlackLines) => {
            // Step 3: Announce blackline changes to UI subscribers
            if (savedBlackLines && !savedBlackLines.errorMessage) {
              const enrichedBlackLines = this.lineEditStateService.enrichSavedBlackLines(
                savedBlackLines,
                [enrichedBlackLine]
              );
              this.lineEditService.announceBlackLineChanges(enrichedBlackLines);
              this.loggerService.info('Blackline comment saved successfully');
              this.messageService.showSnackBar('Black Line Saved', 'CLOSE');
            } else {
              // Log error but don't fail the update - database already updated
              const errorMsg = savedBlackLines?.errorMessage || 'Failed to save blackline comment';
              this.loggerService.error(errorMsg);
              this.messageService.showSnackBar('Run updated but blackline comment failed: ' + errorMsg, 'CLOSE');
            }

            // Return success with updated run and backend's specific message
            return of({
              success: true,
              message: successMessage,
              previousName: updateResult.previousName,
              previousDescription: updateResult.previousDescription,
              run: updateResult.run
            } as RunEditResult);
          }),
          catchError((blacklineError) => {
            // Log error but don't fail the update - database already updated
            this.loggerService.error('Failed to create blackline comment: ' + blacklineError);
            this.messageService.showSnackBar('Run updated but blackline comment failed', 'CLOSE');

            // Still return success for the metadata update with backend's specific message
            return of({
              success: true,
              message: successMessage + ' (blackline comment failed).',
              previousName: updateResult.previousName,
              previousDescription: updateResult.previousDescription,
              run: updateResult.run
            } as RunEditResult);
          })
        );
      }),
      catchError((updateError) => {
        const errMsg = updateError.error?.message
          || updateError.error?.errorMessage
          || updateError.message
          || 'Failed to update run metadata';
        this.loggerService.error('Failed to update run: ' + errMsg);
        this.messageService.showSnackBar(errMsg, 'CLOSE');
        return of({
          success: false,
          message: errMsg,
          previousName: null,
          previousDescription: null,
          run: null
        } as RunEditResult);
      })
    );
  }
}
