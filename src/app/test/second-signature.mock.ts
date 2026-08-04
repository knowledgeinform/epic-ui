import { BlackRedLineSignature, MandatoryInspectionSecondSignature, SecondSignatureType, WitnessSecondSignature } from "@app/interfaces/second-signature.dto";
import { usersMock } from "./users.mock";
import { programRoleMock } from "./program-role.mock";

export const blackLineSignatureMock: BlackRedLineSignature = {
    pk: 1,
    timestamp: new Date(),
    type: SecondSignatureType.BLACK_RED_LINE,
    user: usersMock.asDTO(),
    comment: null,
    programRole: programRoleMock
}

export const mandatoryInspectionSecondSignatureMock: MandatoryInspectionSecondSignature = {
    pk: 1, 
    timestamp: new Date(),
    type: SecondSignatureType.MANDATORY_INSPECTION,
    user: usersMock.asDTO(),
    stepDef: null
}

export const witnessSecondSignatureMock: WitnessSecondSignature = {
    pk: 1, 
    timestamp: new Date(),
    type: SecondSignatureType.WITNESS,
    user: usersMock.asDTO(),
    stepDef: null
}