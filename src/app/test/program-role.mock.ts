import { ProgramRole } from "@app/interfaces/program-role";
import { programMock } from "./program.mock";
import * as _ from "lodash";

export const programRoleMock: ProgramRole = new ProgramRole
_.assign(programMock, {
    pk: 1,
    name: "IT Lead",
    blackRedLineSignatures: null,
    deletable: false,
    programPk: programMock.pk,
    bypassValidation: true  
});