import {StepGroupDef} from '@app/interfaces/step-group-def';
import {ProcedureDetailsDTO} from '@app/interfaces/procedure-details.dto';
import * as _ from 'lodash';
import {StepGroupDefDTO} from './interfaces/step-group-def.dto';
import {StepType} from '@app/interfaces/step-type.dto';
import {CommentDto} from '@app/interfaces/comment.dto';
import {BlackRedLineSignature, SecondSignatureType} from '@app/interfaces/second-signature.dto';
import {Users} from '@app/interfaces/users';
import {EditType} from '@app/interfaces/edit-type.dto';
import {StepDefAttachment} from '@app/interfaces/attachment';
import {UsersDTO} from './interfaces/users.dto';
import { StepDef } from './interfaces/step-def.interface';
import { ProcedureDetails } from './interfaces/procedure-details';
import * as moment from 'moment';
import { Run } from './interfaces/Run';
import { ProgramRoleDTO } from './interfaces/program-role.dto';
import {StepTableRow} from "@app/interfaces/step-table-row";

export class Utils {

  static entryTypes = [
    {
      value: StepType.CHECKBOX,
      display: 'Checkbox/Confirmation'
    },
    {
      value: StepType.SINGLE_VALUE,
      display: 'Single Input'
    },
    {
      value: StepType.TABLE,
      display: 'Table'
    }
  ];

  static getSystemPin(): string {
    let systemPin = '';
    for (let i = 0; i < this.getPinLength(); i++) {
      systemPin = systemPin + '0';
    }
    return systemPin;
  }

  static getPinLength(): number {
    return 6;
  }

  /**
   * Step groups are hierarchal - each step group in a top-level array can be parent to another array of step groups, and so on. The relationship between child and parent groups is circular in nature, which cause a TypeError when the hierarchy is put into JSON form for sending to the server. This method makes the hierarchy JSON friendly by removing the circular references.
   * @deprecated Use `Local.asDTO()` instead.
  */
  static makeStepGroupArrayJsonFriendly(array: StepGroupDefDTO[], procedureData: ProcedureDetailsDTO): StepGroupDefDTO[] {
    if (_.isEmpty(array)) {
      return array;
    }
    array.forEach(sg => {
      if (!_.isNil(sg.stepGroupDefParent)) {
        sg.stepGroupDefParent = {pk: sg.stepGroupDefParent.pk};
        sg.procedureDetails = null;
      } else {
        sg.stepGroupDefParent = null;
        sg.procedureDetails = procedureData;
        delete sg.procedureDetails.stepGroupDefs;
        delete sg.procedureDetails.redliningEnabled;

      }
      delete sg['selectDisplayName'];
      // if (sg.stepGroupDefsChildren !== null && sg.stepGroupDefsChildren !== undefined && sg.stepGroupDefsChildren.length > 0) {
      if (!_.isEmpty(sg.stepGroupDefsChildren)) {
        sg.stepGroupDefsChildren = this.makeStepGroupArrayJsonFriendly(sg.stepGroupDefsChildren, procedureData);
      }
    });
    return array;
  }


  static createGroupListingOptions(array, parentOrder, includeSelf, selfGroupPk, includeNoParentGroupOption): any[] {
    const resultArray = [];
    if (includeNoParentGroupOption) {
      resultArray.push({pk: -1, selectDisplayName: 'No Parent - Make This a Top Level Step Group'});
    }
    if (array !== null && array !== undefined && array.length > 0) {
      array.forEach(item => {
        if (item.editType !== EditType.REDLINE_DELETE) {
          const parentVal = parentOrder == null ? '' : parentOrder + '.';
          const parentDisplayOrder = parentVal + item.displayOrder;
          if (includeSelf || (item.pk !== selfGroupPk)) {
            const result = _.cloneDeep(item);
            result.selectDisplayName = parentDisplayOrder + ': ' + result.stepGroupName;
            resultArray.push(result);
            if (item.stepGroupDefsChildren !== null && item.stepGroupDefsChildren !== undefined && item.stepGroupDefsChildren.length > 0) {
              const childArray = Utils.createGroupListingOptions(item.stepGroupDefsChildren, parentDisplayOrder, includeSelf, selfGroupPk, false);
              childArray.forEach(child => {
                resultArray.push(child);
              });
            }
          }
        }
      });
    }
    return resultArray;
  }

  static findGroupByPk(groups: StepGroupDef[], groupPk: number): StepGroupDef {
    let foundGroup: StepGroupDef = null;
    groups.forEach(function (group) {
      if (foundGroup == null) {
        if (group.pk === groupPk) {
          foundGroup = group;
        } else if (group.stepGroupDefsChildren) {
          foundGroup = Utils.findGroupByPk(group.stepGroupDefsChildren, groupPk);
        }
      }
    });
    return foundGroup;
  }

  static replaceStepGroupInProcedureDataWithChangedGroup(array: StepGroupDef[], stepGroup: StepGroupDef): StepGroupDef[] {
    if (_.isEmpty(array)) {
      // empty array, return it
      return array;
    }
    const resultArray = [];
    let found = false;
    array.forEach(sg => {
      if (!found && sg.pk === stepGroup.pk) {
        sg = stepGroup;
        found = true;
      }
      if (!found) {
        // need to check the child step groups for a match
        if (!_.isEmpty(sg.stepGroupDefsChildren)) {
          sg.stepGroupDefsChildren = this.replaceStepGroupInProcedureDataWithChangedGroup(sg.stepGroupDefsChildren, stepGroup);
        }
      }
      resultArray.push(sg);
    });
    return resultArray;
  }

  static updateStepFieldsFromForm(formVal: Partial<StepDef>, step: StepDef, stepType: StepType, stepGroupPk: number, stepTableRows: StepTableRow[], stepDefAttachments: StepDefAttachment[]): StepDef {
    Object.assign(step, formVal);
    step.type = stepType;

    // table steps need additional info added to the data object
    if (step.type === StepType.TABLE) {
      step.stepTableRows = stepTableRows;
    }

    step.stepDefAttachments = stepDefAttachments;
    return step;
  }

  static createBlackRedLineSignature(comment: CommentDto, userInfo: Users, role: ProgramRoleDTO): BlackRedLineSignature {
    const signature = new BlackRedLineSignature();
    signature.comment = comment;
    signature.type = SecondSignatureType.BLACK_RED_LINE;
    signature.user = userInfo.asDTO();
    signature.programRole = role;
    return signature;
  }

  // this function updates all the black/red line comments in the run and its constituent parts with blackRedLine signatures.
  static updateLineEditSignaturesForRun(signatures: BlackRedLineSignature[], procedureData: ProcedureDetails): ProcedureDetails {

    const signatureMap: _.Dictionary<BlackRedLineSignature[]> = _.groupBy(signatures, s => s.comment.pk);

    // update the comments on the procedure detail
    procedureData.blackLineComments.forEach(b => {
      b.blackRedLineSignatures = _.get(signatureMap, b.pk, undefined);
    });

    if (procedureData.editType === EditType.REDLINE_EDIT) {
      procedureData.redLineComments.forEach(r => {
          r.blackRedLineSignatures = _.get(signatureMap, r.pk, undefined);
      });
    }

    // update the comments on the instructions
    procedureData.procedureInstructions.forEach(instruction => {
      instruction.blackLineComments.forEach(b => {
        b.blackRedLineSignatures = _.get(signatureMap, b.pk, undefined);
      });
      if (procedureData.editType === EditType.REDLINE_EDIT) {
        instruction.redLineComments.forEach(r => {
          r.blackRedLineSignatures = _.get(signatureMap, r.pk, undefined);
        });
      }
    });

    procedureData.stepGroupDefs = Utils.updateSignaturesForStepGroups(signatureMap, procedureData.stepGroupDefs, procedureData);
    return procedureData;
  }

  // this is a helper recursive function to deal with update red/black signatures on steps and step groups.
  static updateSignaturesForStepGroups(signatureMap: _.Dictionary<BlackRedLineSignature[]>, stepGroups: StepGroupDef[], procedureData: ProcedureDetails): StepGroupDef[] {
    if (_.isEmpty(stepGroups)) {
      return stepGroups;
    }

    stepGroups.forEach(sg => {
      // update this step group's comments
      sg.blackLineComments.forEach(b => {
          b.blackRedLineSignatures = _.get(signatureMap, b.pk, undefined);
      });
      if (procedureData.editType === EditType.REDLINE_EDIT) {
        sg.redLineComments.forEach(r => {
          r.blackRedLineSignatures = _.get(signatureMap, r.pk, undefined);
        });
      }

      // update its steps' comments
      sg.stepDefs.forEach(step => {
        step.blackLineComments.forEach(b => {
          b.blackRedLineSignatures = _.get(signatureMap, b.pk, undefined);
        });
        if (procedureData.editType === EditType.REDLINE_EDIT) {
          step.redLineComments.forEach(r => {
            r.blackRedLineSignatures = _.get(signatureMap, r.pk, undefined);
          });
        }
      });

      // finally update its child groups
      if (!_.isEmpty(sg.stepGroupDefsChildren)) {
        sg.stepGroupDefsChildren = this.updateSignaturesForStepGroups(signatureMap, sg.stepGroupDefsChildren, procedureData);
      }
    });
    return stepGroups;
  }

  public static dateAsJavaString(date: Date): string {
    return date ? moment(date).format('YYYY-MM-DDTHH:mm:ss.SSSZ') : null;
  }

  /**
   * Performs a recursive traversal of the input groups and returns all steps, including input.
   */
  public static getAllStepsInGroup(group: StepGroupDef): StepDef[] {
    const groupsToScan: StepGroupDef[] = [group];
    const allSteps: StepDef[] = [];
    while (groupsToScan.length) {
      const curGroup: StepGroupDef = groupsToScan.splice(0,1)[0];
      groupsToScan.push(...curGroup.stepGroupDefsChildren);
      allSteps.push(...curGroup.stepDefs);
    }
    return allSteps;
  }

  /**
   * Performs a recursive traversal of the input groups and returns all groups, including input.
   */
  public static getAllGroupsForGroups(groups: StepGroupDef[]): StepGroupDef[] {
    const groupsToScan: StepGroupDef[] = [...groups];
    const allGroups: StepGroupDef[] = [...groups];
    while (groupsToScan.length) {
      const curGroup: StepGroupDef = groupsToScan.splice(0,1)[0];
      groupsToScan.push(...curGroup.stepGroupDefsChildren);
      allGroups.push(...curGroup.stepGroupDefsChildren);
    }
    return allGroups;
  }

  public static getAllStepsInRun(run: Run): StepDef[] {
    if (!run) { console.error('Missing run parameter'); return []; }
    return this.getAllStepsInProcedureDetails(run.procedureDetails);
  }

  public static getAllStepsInProcedureDetails(procedureDetails: ProcedureDetails): StepDef[] {
    if (!procedureDetails) { console.error('Missing procedure details parameters in Utils.getAllStepsInProcedureDetails'); return []; }
    const allGroups = this.getAllGroupsForGroups(procedureDetails.stepGroupDefs);
    const allSteps: StepDef[] = _.chain(allGroups)
      .map( g => this.getAllStepsInGroup(g) )
      .flatten()
      .value();
    return allSteps;
  }

  public static updateDisplayOrdersForArrayItems(array: any[], startingDisplayOrder?: number, endingIndexInclusive?: number): any[] {
    let indexToStartWith = 0;
    if (startingDisplayOrder) indexToStartWith = startingDisplayOrder - 1;
    let indexToEndWith = array.length - 1;
    if (endingIndexInclusive) indexToEndWith = endingIndexInclusive;
    for (let i = indexToStartWith; i <= indexToEndWith; i++) {
      array[i].displayOrder = i + 1;
    }
    return array;
  }

  public static updateArrayWithNewElementsBasedOnPK(arrayToUpdate: any[], newElements: any[]) {
    return _.map(arrayToUpdate, originalElement => {
      return _.find(newElements, updatedElement => updatedElement.pk === originalElement.pk || !originalElement.pk) || originalElement;
    });
  }

  /*Define max length for rich text editor/summernote fields */
  public static getMaxRichTextEditorLength(){
    let maxLength: number = 15000;
    return maxLength;
  }
  /* Define the maximum number of search results to be returned at a time */
  public static getSearchLimit() {
    return 20;
  }
 /**
  * Clean up some content in "bad" tags such as script, etc. from pasted html content
  * @param input
  * @returns
  */
  public static cleanPastedHTML(input) {
    // 1. remove line breaks by trim
    var output =input.trim();
    // 2. strip Word generated HTML comments
    var commentSripper = new RegExp('<!--(.*?)-->','g');
    output = output.replace(commentSripper, '');
    // 3. Remove everything in between and including bad tags
    var badTags = ['script','applet','embed','noframes','noscript'];
    for (var i=0; i< badTags.length; i++) {
      var tagStripper = new RegExp('<'+badTags[i]+'.*?'+badTags[i]+'(.*?)>', 'gi');
      output = output.replace(tagStripper, '');
    }
    // 4. remove bad attributes ' start="..."'
    var badAttributes = ['start'];
    for (var i=0; i< badAttributes.length; i++) {
      var attributeStripper = new RegExp(' ' + badAttributes[i] + '="(.*?)"','gi');
      output = output.replace(attributeStripper, '');
    }

    return output;
  }
  /**
   * Strip ou font color and background
   * @param input
   */
  public static cleanFontColorAndBackground(input) {
    return input.replace(/background\s*:[^";]+;?|color\s*:[^";];?/g, '');
  }

  /**
   * Sanitize pasted rich text while preserving basic formatting tags
   * Removes style-heavy and unsafe attributes, commonly injected by Word.
   */
  public static sanitizePastedRichText(input: string): string {
    if (_.isNil(input) || input.length === 0) return input;

    const attrsToRemove = new Set(['style', 'class', 'lang', 'dir']);
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${input}</div>`, 'text/html');
    const root = doc.body.firstElementChild as HTMLElement;
    if (!root) return input;

    const sanitizeNode = (node: Node) => {
      if (!node || !node.childNodes) return;
      const children = Array.from(node.childNodes);
      children.forEach(child => {
        if (child.nodeType !== Node.ELEMENT_NODE) return;
        const element = child as HTMLElement;
        Array.from(element.attributes).forEach(attr => {
          const name = attr.name.toLowerCase();
          if (attrsToRemove.has(name)) {
            element.removeAttribute(attr.name);
          }
        });

        sanitizeNode(element);
      });
    };

    sanitizeNode(root);
    return root.innerHTML;
  }

  /**
   * Clean up all html tags.
   * @param str
   * @returns
   */
  public static cleanAllHTMLTags(str) {
    if (_.isNil(str)) return false;
    str = str.toString();
    // Regular expression to identify HTML tags in
    // the input string. Replacing the identified
    // HTML tag with a null string.
    return str.replace( /(<([^>]+)>)/ig, '');
  }
}
