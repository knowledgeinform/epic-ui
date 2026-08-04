import {SGNode} from "@app/components/multi-select-groups-steps/multi-select-groups-steps.component";
import {stepBlackLineMockArray} from "@app/test/black-line.mock";

export const nodeListMock: SGNode[] = [
  {
    name: "Alpha",
    isParent: false,
    pk: 1,
    leaf: null,
    children: null,
    comment : stepBlackLineMockArray[0]
  },
  {
    name: "Beta",
    isParent: false,
    pk: 2,
    leaf: null,
    children: null,
    comment : stepBlackLineMockArray[1]
  },
];
