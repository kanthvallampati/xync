import { FlagType } from "../modules/flags/models/feature-flag.model";

export const FLAG_TYPES = [
  { value: FlagType.BOOLEAN, label: 'Boolean' },
  { value: FlagType.STRING, label: 'String' },
  { value: FlagType.NUMBER, label: 'Number' },
  { value: FlagType.JSON, label: 'JSON' }
];