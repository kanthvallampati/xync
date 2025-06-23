export enum FlagType {
  BOOLEAN = 'boolean',
  STRING = 'string',
  NUMBER = 'number',
  JSON = 'json'
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  kind: FlagType;
  temporary: boolean;
  tags: string[];
  environments: Environment[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  variations: Variation[];
  defaultVariation: number;
  clientSideAvailability: {
    usingEnvironmentId: boolean;
    usingMobileKey: boolean;
  };
  rules: TargetingRule[];
  fallthrough: Fallthrough;
  offVariation: number;
  prerequisites: Prerequisite[];
  targets: Target[];
  contextTargets: ContextTarget[];
}

export interface Environment {
  key: string;
  name: string;
  color: string;
  apiKey: string;
  mobileKey: string;
  _id: string;
  _site: {
    href: string;
    type: string;
  };
}

export interface Variation {
  value: any;
  name?: string;
  description?: string;
  _id: number;
}

export interface TargetingRule {
  clauses: Clause[];
  variation: number;
  trackEvents: boolean;
  _id: string;
}

export interface Clause {
  attribute: string;
  op: 'in' | 'endsWith' | 'startsWith' | 'matches' | 'contains' | 'lessThan' | 'lessThanOrEqual' | 'greaterThan' | 'greaterThanOrEqual' | 'before' | 'after' | 'segmentMatch' | 'semVerEqual' | 'semVerLessThan' | 'semVerGreaterThan';
  values: any[];
  negate: boolean;
}

export interface Fallthrough {
  variation: number;
  rollout?: Rollout;
}

export interface Rollout {
  variations: RolloutVariation[];
  bucketBy?: string;
}

export interface RolloutVariation {
  variation: number;
  weight: number;
}

export interface Prerequisite {
  key: string;
  variation: number;
}

export interface Target {
  values: string[];
  variation: number;
}

export interface ContextTarget {
  values: string[];
  variation: number;
  contextKind: string;
}

export interface User {
  key: string;
  name?: string;
  email?: string;
  custom?: { [key: string]: any };
  privateAttributeNames?: string[];
  secondary?: string;
  ip?: string;
  country?: string;
  avatar?: string;
}

export interface FlagEvaluation {
  flagKey: string;
  user: User;
  value: any;
  variationIndex: number;
  reason: EvaluationReason;
  version: number;
  trackEvents: boolean;
}

export interface EvaluationReason {
  kind: 'OFF' | 'FALLTHROUGH' | 'RULE_MATCH' | 'PREREQUISITE_FAILED' | 'TARGET_MATCH' | 'CONTEXT_KIND_MATCH' | 'ERROR';
  ruleIndex?: number;
  ruleId?: string;
  prerequisiteKey?: string;
  inExperiment?: boolean;
  bigSegmentsStatus?: 'HEALTHY' | 'STALE' | 'NOT_CONFIGURED';
} 