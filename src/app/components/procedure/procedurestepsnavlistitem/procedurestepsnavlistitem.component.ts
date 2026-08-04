import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';
import {StepDisplayNamePipe} from '@app/pipes/step-display-name.pipe';
import { StepGroupDef } from '@app/interfaces/step-group-def';
import { ProcedureDetails } from '@app/interfaces/procedure-details';


export interface Node {
  pk: number;
  name: string;
  anchorLink: string;
  children: Node[];
}

@Component({
  selector: 'app-procedurestepsnavlistitem',
  templateUrl: './procedurestepsnavlistitem.component.html',
  styleUrls: ['./procedurestepsnavlistitem.component.css', '../instructions/procedureinstructioninfo/procedureinstructioninfo.component.css']
})

export class ProcedurestepsnavlistitemComponent implements OnInit {

  @Input() procedureData: ProcedureDetails;
  treeData = new MatTreeNestedDataSource<Node>();
  treeControl = new NestedTreeControl<Node>((node: Node) => node.children);
  expandThis: boolean;
  expandAll: boolean;
  @ViewChild('stepNavTree', /* TODO: add static flag */ {}) navTree;

  constructor() { }

  // IMPORTANT! These anchor names are generated based on the ids for a step group's expansion panel. Do NOT change the anchor names here
  // without also changing those ids to match, and vice versa.
  ngOnInit() {
    this.initTreeDataSources();
    this.expandAll = false;

  }

  initTreeDataSources() {
    if (this.procedureData !== null && this.procedureData !== undefined) {
      const nodes = this.convertProcedureDataToNodeArray(this.procedureData.stepGroupDefs);
      this.treeData.data = nodes;
      this.treeControl.dataNodes = nodes;
    }
  }

  hasChild = (_: number, node: Node) => !!node.children && node.children.length > 0;

  convertProcedureDataToNodeArray(stepGroupArray: StepGroupDef[]): Node[] {
    if (stepGroupArray === null || stepGroupArray === undefined) {
      return [];
    }
    const topLevelNodeArray = [];
    stepGroupArray.forEach(stepGroup => {
      // go through all the steps first
      const nodeArray = [];
      const steps = stepGroup.stepDefs;
      if (steps !== null && steps !== undefined && steps.length > 0 ) {
        steps.forEach(step => {
          const stepNode: Node = {
            pk: step.pk,
            name: new StepDisplayNamePipe().transform(step),
            anchorLink: 'p' + step.pk + '_' + new StepDisplayNamePipe().transform(step).split(' ').join('_').split('.').join('_'),
            children: null
          };
          nodeArray.push(stepNode);
        });
      }

      let tempArray = [];
      // now through children sub groups
      if (stepGroup.stepGroupDefsChildren !== null && stepGroup.stepGroupDefsChildren !== undefined &&
        stepGroup.stepGroupDefsChildren.length > 0) {
        tempArray = this.convertProcedureDataToNodeArray(stepGroup.stepGroupDefsChildren);
      }
      tempArray.forEach(child => {
        nodeArray.push(child);
      });
      const stepGroupNode: Node = {
        pk: stepGroup.pk,
        name: stepGroup.stepGroupName,
        anchorLink: 'p' + stepGroup.pk + '_' + stepGroup.stepGroupName.split(' ').join('_').split('.').join('_'),
        children: nodeArray
      };
      topLevelNodeArray.push(stepGroupNode);
    });
    return topLevelNodeArray;
  }


  // this function deals with the anchor functionality - if you click on the anchor icon on a nav list item, the main content scrolls to
  // the corresponding item in that view and expands it (and all its children and its parent). In order to get the panels to expand, this
  // function emits a "click" event. That event goes out to all of the expansion panels in the main content - refer to
  // procedurestepgroups.ts to see how that event is handled upon receipt. After the event is dispatched, this function times out for a bit
  // to allow time for all the main content panels to expand, then it scrolls the window to the desired element.
  goTo(node: Node): void {
    this.expandThis = true;
    const myPk = node.pk;
    const elem = document.getElementById(node.anchorLink) as HTMLElement;
    const data = {'input': true, 'primaryTarget': myPk, 'secondaryTarget': myPk};
    const clickEvent = new CustomEvent('click', {detail: data});
    elem.dispatchEvent(clickEvent);
    setTimeout(() => {
      // window.location.hash = '';
      // window.location.hash = node.anchorLink;
      elem.scrollIntoView(true);
    }, 500);
  }

  toggleExpandAllTree(): void {
    this.expandAll = !this.expandAll;
    if (this.expandAll) {
      this.navTree.treeControl.expandAll();
    } else {
      this.navTree.treeControl.collapseAll();
    }
  }

  refreshNodes(): void {
    this.initTreeDataSources();
    this.expandAll = false;
  }

}
