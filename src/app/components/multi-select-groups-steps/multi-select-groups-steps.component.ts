import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {EPICWSService} from '@app/services/epic-ws.service';
import {StepGroupDef} from '@app/interfaces/step-group-def';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {SelectionModel} from '@angular/cdk/collections';
import * as _ from 'lodash';
import {StepDisplayNamePipe} from '@app/pipes/step-display-name.pipe';
import {StepDef} from '@app/interfaces/step-def.interface';
import {ProcedureDetails} from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';
import {RunValidationService} from '@app/services/run-validation.service';
import {LineEditReportingService, LineList} from "@app/services/line-edit-reporting.service";
import {RedBlackLineComment, RedLineComment} from "@app/interfaces/comment.dto";
import {ProcedureInstruction} from "@app/interfaces/procedure-instruction";
import {BulkSignTypePipe} from "@app/pipes/bulk-sign-type.pipe";
import {BulkLineValidationType} from "@app/interfaces/bulk-line-validation-type";
import {BulkLineDisplayNamePipe} from "@app/pipes/bulk-line-display-name.pipe";
import {Utils} from "@app/utils";
import {ProgramRoleDTO} from "@app/interfaces/program-role.dto";
import {LineEditService} from "@app/services/line-edit.service";


// node for an step/group item
export class SGNode {
  name: string;
  isParent: boolean;
  pk: number;
  leaf: any;
  children?: SGNode[];
  comment?: RedBlackLineComment;
}

export class SGFlatNode {
  name: string;
  isParent: boolean;
  pk: number;
  level: number;
  leaf: any;
  expandable: boolean;
  comment?: RedBlackLineComment;
}

@Component({
  selector: 'app-multi-select-groups-steps',
  templateUrl: './multi-select-groups-steps.component.html',
  styleUrls: ['./multi-select-groups-steps.component.scss']
})
export class MultiSelectGroupsStepsComponent implements OnInit {

  fetching = false;
  groupsInTheSelectedProcedure: StepGroupDef[] = [];

  @Input() redBlackLineComments: boolean = false;
  @Input() redLines: boolean = true;
  @Input() showNotValidatedOnly: boolean;  /** only show steps not validated yet**/
  @Input() procedureData: ProcedureDetails;
  @Input() role: ProgramRoleDTO;
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<SGFlatNode, SGNode>();
  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<SGNode, SGFlatNode>();

  treeControl: FlatTreeControl<SGFlatNode>;
  treeFlattener: MatTreeFlattener<SGNode, SGFlatNode>;
  dataSource: MatTreeFlatDataSource<SGNode, SGFlatNode>;
  checklistSelection = new SelectionModel<SGNode>(true);
  findCommentsForRole = false;
  noStepsToManuallyValidate = false;

  @Output() selectionsChange: EventEmitter<any> = new EventEmitter();
  @Output() selectedGroupsChange: EventEmitter<any> = new EventEmitter();
  @Output() fetchingChange: EventEmitter<boolean> = new EventEmitter();

  constructor( public epicService: EPICWSService,
               public errorDialog: MatDialog,
               private loggerService: LoggerService,
               private validationService: RunValidationService,
               protected lineEditReportingService: LineEditReportingService,
               protected lineEditService: LineEditService,
  ) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<SGFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.fetchingChange.emit(this.fetching);
  }

  getLevel = (node: SGFlatNode) => node.level;
  isExpandable = (node: SGFlatNode) => node.expandable;
  getChildren = (node: SGNode): SGNode[] => node.children;
  hasChild = (_: number, _nodeData: SGFlatNode) => _nodeData.expandable;
  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: SGNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.pk === node.pk && existingNode.name === node.name
      ? existingNode
      : new SGFlatNode();
    flatNode.name = node.name;
    flatNode.pk = node.pk;
    flatNode.isParent = node.isParent;
    flatNode.leaf = node.leaf;
    flatNode.level = level;
    flatNode.expandable = !!node.children && node.children.length > 0;
    flatNode.comment = node.comment;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }
  ngOnInit(): void {
    this.loadProcedureDefinition(this.procedureData, this.redBlackLineComments);
  }
  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: SGFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: SGFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the item selection. Select/deselect all the descendants node */
  itemSelectionToggle(node: SGFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf  item selection. Check all the parents to see if they changed */
  leafItemSelectionToggle(node: SGFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

   /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: SGFlatNode): void {
    let parent: SGFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
    this.selectionsChange.emit( this.checklistSelection);
    this.selectedGroupsChange.emit(this.groupsInTheSelectedProcedure);
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: SGFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }
   /* Get the parent node of a node */
  getParentNode(node: SGFlatNode): SGFlatNode | null {
    const currentLevel = this.getLevel(node);
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  protected createListNodes(): SGNode[]{

    const node = [];

    let commentLines = null;
    let stepLines = null;
    let instructionLines = null;
    let groupLines = null;

    if (this.redLines) {
      commentLines = this.convertCommentListNodeArray(this.lineEditReportingService.procedureLevelRedLines);
      stepLines = this.createLineListParentNode(this.lineEditReportingService.stepRedLines, BulkLineValidationType.STEP);
      instructionLines = this.createLineListParentNode(this.lineEditReportingService.instructionRedLines, BulkLineValidationType.INSTRUCTION);
      groupLines = this.createLineListParentNode(this.lineEditReportingService.groupRedLines, BulkLineValidationType.STEPGROUP);
    } else {
      commentLines = this.convertCommentListNodeArray(this.lineEditReportingService.procedureLevelBlackLines);
      stepLines = this.createLineListParentNode(this.lineEditReportingService.stepBlackLines, BulkLineValidationType.STEP);
    }

    if (commentLines && commentLines.length > 0 && commentLines[0].children && commentLines[0].children.length > 0) {
       node.push(commentLines[0])
    }
    if (stepLines && stepLines.length > 0 && stepLines[0].children && stepLines[0].children.length > 0) {
      node.push(stepLines[0])
    }

    if (instructionLines && instructionLines.length > 0 && instructionLines[0].children && instructionLines[0].children.length > 0) {
      node.push(instructionLines[0])
    }
    if (groupLines && groupLines.length > 0 && groupLines[0].children && groupLines[0].children.length > 0) {
      node.push(groupLines[0])
    }

    return node;
  }
   protected createLineListParentNode(defs: LineList<StepDef> | LineList<StepGroupDef>
     |  LineList<ProcedureInstruction>, bulkLineValidationType: BulkLineValidationType): SGNode[]{
    if (defs === null || defs === undefined  || defs.getLines(this.procedureData.pk).length == 0) {
      return [];
    }

    const topLevelNodeArray = [];
    //Handles top node for Steps, Step Groups, and Instructions
     const typeNode: SGNode = {
        pk: defs.getLines(this.procedureData.pk)[0].pk,
        name: new BulkSignTypePipe().transform(bulkLineValidationType),
        isParent: true,
        leaf: null,
        children: []
      };

      topLevelNodeArray.push(typeNode);

      this.convertLineListToNodeArray(defs, bulkLineValidationType, typeNode);

    return topLevelNodeArray;
}
  protected convertLineListToNodeArray(defs: LineList<StepDef> | LineList<StepGroupDef> |
    LineList<ProcedureInstruction>, bulkLineValidationType:BulkLineValidationType, typeNode: SGNode): SGNode[]{

      const topLevelNodeArray = [];

      defs.getLines(this.procedureData.pk).forEach(def => {
        const parentNode: SGNode = {
          pk: def.pk,
          name: new BulkLineDisplayNamePipe().transform(def),
          isParent: true,
          leaf: null,
          children: []
        };

        if (this.redLines) {
          const  ret  = this.lineEditService.getSignaturesForRole(this.role, def.redLineComments);
          const lineCommentsUnsignedForRole = ret.selectedComments;
          this.findCommentsForRole = ret.findApproverForThisRole;

          if (lineCommentsUnsignedForRole && lineCommentsUnsignedForRole.length > 0){
            lineCommentsUnsignedForRole.forEach(childDef => {
              const childNode: SGNode = {
                isParent: false,
                children: null,
                name: childDef.commentText,
                leaf: childDef,
                pk: childDef.pk,
                comment: childDef
              };

              parentNode.children.push(childNode);
            });
            typeNode.children.push(parentNode);
            topLevelNodeArray.push(parentNode);
          } else {
            return [];
          }
        } else {
           const ret = this.lineEditService.getSignaturesForRole(this.role, def.blackLineComments);
           const lineCommentsUnsignedForRole = ret.selectedComments;
           this.findCommentsForRole = ret.findApproverForThisRole;

          if (lineCommentsUnsignedForRole && lineCommentsUnsignedForRole.length > 0) {
            lineCommentsUnsignedForRole.forEach(childDef => {
              const childNode: SGNode = {
                isParent: false,
                children: null,
                name: childDef.commentText,
                leaf: childDef,
                pk: childDef.pk,
                comment: childDef
              };

              parentNode.children.push(childNode);
            });
            typeNode.children.push(parentNode);
            topLevelNodeArray.push(parentNode);
          } else {
            return [];
          }
        }
      });

      return topLevelNodeArray;
  }

  protected convertCommentListNodeArray(defs: LineList<RedLineComment>): SGNode[]{

    if (defs === null || defs === undefined || defs.getLines(this.procedureData.pk).length == 0) {
      return [];
    }

    //Handles top node for Procedure
    const typeNode: SGNode = {
      pk: defs.getLines(this.procedureData.pk)[0].pk,
      name: new BulkSignTypePipe().transform(BulkLineValidationType.PROCEDURE),
      isParent: true,
      leaf: null,
      children: []
    };
    const topLevelNodeArray = [];

     const ret = this.lineEditService.getSignaturesForRole(this.role, defs.getLines(this.procedureData.pk));
     const lineCommentsUnsignedForRole = ret.selectedComments;
     this.findCommentsForRole = ret.findApproverForThisRole;

    if (lineCommentsUnsignedForRole && lineCommentsUnsignedForRole.length > 0) {
      lineCommentsUnsignedForRole.forEach(def => {
        const childNode: SGNode = {
          isParent: false,
          children: null,
          name: def.commentText,
          leaf: def,
          pk: def.pk,
          comment: def
        };
        typeNode.children.push(childNode);
      });

      topLevelNodeArray.push(typeNode);
    } else
      return [];

    return topLevelNodeArray;
  }

  protected convertStepGroupsToNodeArray(defs: any[]): SGNode[] {
    if (defs === null || defs === undefined) {
      return [];
    }
      const topLevelNodeArray = [];
      defs.forEach(def => {
        if (!this.showNotValidatedOnly || !_.isNil(this.validationService.validateStepGroup(this.procedureData.pk, def))) {
            const groupNode: SGNode = {
              pk: def.pk,
              name: def.stepGroupName,
              isParent: true,
              leaf: null,
              children: []
            };

            // let nodeArray = [];
            const steps = def.stepDefs;
            if (steps !== null && steps !== undefined && steps.length > 0) {
              steps.forEach(step => {
                if (!this.showNotValidatedOnly || !_.isNil(this.validationService.validateStep(this.procedureData.pk, step))) {
                  const stepNode: SGNode = {
                    isParent: false,
                    children: null,
                    name: new StepDisplayNamePipe().transform(step),
                    leaf: step,
                    pk: step.pk
                  };
                  if (stepNode != null) {
                    groupNode.children.push(stepNode);
                  }
                }
              });
            }

            // go through child subgroups
            if (def.stepGroupDefsChildren !== null && def.stepGroupDefsChildren !== undefined && def.stepGroupDefsChildren.length > 0) {
              this.groupsInTheSelectedProcedure.push(...def.stepGroupDefsChildren);
              groupNode.children = groupNode.children.concat(this.convertStepGroupsToNodeArray(def.stepGroupDefsChildren));
            }
            if (groupNode != null && groupNode.children != null && groupNode.children.length > 0) {
              topLevelNodeArray.push(groupNode);
            }
          }
      });

      return topLevelNodeArray;
  }

  // loads the procedure definition- either populating line lines or step groups + steps
  loadProcedureDefinition(thisProcedureData: ProcedureDetails, redBlackLineComments: boolean) {
    this.fetching = true;
    this.noStepsToManuallyValidate = false;

    if (redBlackLineComments) {
      this.loggerService.info('Loading line lists for selected procedure revision with name ' + thisProcedureData.id);
      this.fetchingChange.emit(this.fetching);
      this.dataSource.data = this.createListNodes();
    } else {
      this.loggerService.info('Loading step group for selected procedure revision with name ' + thisProcedureData.id);
      this.fetchingChange.emit(this.fetching);

      this.epicService.getStepGroupDefs(thisProcedureData.pk).subscribe((data) => {
        if (data.error) {
          this.loggerService.error('Could not retrieve groups/step for selected procedure revision with pk ' + thisProcedureData.pk);
          this.errorDialog.open(ErrorDialogComponent, {
            data: {
              description: 'Error retrieving the steps/groups for selected procedure',
              errorMessage: data.error
            }
          });
        }
        else {
          this.groupsInTheSelectedProcedure = data;
          this.dataSource.data = this.convertStepGroupsToNodeArray(data);
          if (this.dataSource.data.length === 0)
          {
            this.noStepsToManuallyValidate = true;
          }
        }
      });
    }
    this.fetching = false;
    this.fetchingChange.emit(this.fetching);
  }
}
