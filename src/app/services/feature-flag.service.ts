import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FeatureFlag, User, FlagEvaluation, Environment, FlagType } from '../models/feature-flag.model';
import { WorkspaceService } from './workspace.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {
  private flags = new BehaviorSubject<FeatureFlag[]>([]);
  private environments = new BehaviorSubject<Environment[]>([]);
  private evaluations = new BehaviorSubject<FlagEvaluation[]>([]);

  constructor(private workspaceService: WorkspaceService) {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Mock environments
    const mockEnvironments: Environment[] = [
      {
        key: 'production',
        name: 'Production',
        color: '#4CAF50',
        apiKey: 'prod-api-key-123',
        mobileKey: 'prod-mobile-key-123',
        _id: 'env-prod',
        _site: { href: '/environments/production', type: 'environment' }
      },
      {
        key: 'staging',
        name: 'Staging',
        color: '#FF9800',
        apiKey: 'staging-api-key-456',
        mobileKey: 'staging-mobile-key-456',
        _id: 'env-staging',
        _site: { href: '/environments/staging', type: 'environment' }
      },
      {
        key: 'development',
        name: 'Development',
        color: '#2196F3',
        apiKey: 'dev-api-key-789',
        mobileKey: 'dev-mobile-key-789',
        _id: 'env-dev',
        _site: { href: '/environments/development', type: 'environment' }
      }
    ];

    // Mock feature flags
    const mockFlags: FeatureFlag[] = [
      {
        id: 'flag-1',
        key: 'new-user-onboarding',
        name: 'New User Onboarding',
        description: 'Enhanced onboarding flow for new users',
        kind: FlagType.BOOLEAN,
        temporary: false,
        tags: ['onboarding', 'user-experience'],
        environments: mockEnvironments,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        createdBy: 'john.doe@company.com',
        variations: [
          { value: true, name: 'Enabled', _id: 0 },
          { value: false, name: 'Disabled', _id: 1 }
        ],
        defaultVariation: 0,
        clientSideAvailability: {
          usingEnvironmentId: true,
          usingMobileKey: false
        },
        rules: [
          {
            clauses: [
              {
                attribute: 'country',
                op: 'in',
                values: ['US', 'CA'],
                negate: false
              }
            ],
            variation: 0,
            trackEvents: true,
            _id: 'rule-1'
          }
        ],
        fallthrough: { variation: 1 },
        offVariation: 1,
        prerequisites: [],
        targets: [],
        contextTargets: []
      },
      {
        id: 'flag-2',
        key: 'dark-mode',
        name: 'Dark Mode',
        description: 'Dark theme for the application',
        kind: FlagType.BOOLEAN,
        temporary: true,
        tags: ['ui', 'theme'],
        environments: mockEnvironments,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18'),
        createdBy: 'jane.smith@company.com',
        variations: [
          { value: true, name: 'Dark', _id: 0 },
          { value: false, name: 'Light', _id: 1 }
        ],
        defaultVariation: 1,
        clientSideAvailability: {
          usingEnvironmentId: true,
          usingMobileKey: true
        },
        rules: [],
        fallthrough: { variation: 1 },
        offVariation: 1,
        prerequisites: [],
        targets: [
          {
            values: ['user-123', 'user-456'],
            variation: 0
          }
        ],
        contextTargets: []
      },
      {
        id: 'flag-3',
        key: 'pricing-tier',
        name: 'Pricing Tier',
        description: 'Different pricing tiers for users',
        kind: FlagType.STRING,
        temporary: false,
        tags: ['pricing', 'business'],
        environments: mockEnvironments,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-15'),
        createdBy: 'admin@company.com',
        variations: [
          { value: 'basic', name: 'Basic', _id: 0 },
          { value: 'premium', name: 'Premium', _id: 1 },
          { value: 'enterprise', name: 'Enterprise', _id: 2 }
        ],
        defaultVariation: 0,
        clientSideAvailability: {
          usingEnvironmentId: true,
          usingMobileKey: false
        },
        rules: [
          {
            clauses: [
              {
                attribute: 'subscription',
                op: 'in',
                values: ['premium', 'enterprise'],
                negate: false
              }
            ],
            variation: 1,
            trackEvents: true,
            _id: 'rule-2'
          }
        ],
        fallthrough: { variation: 0 },
        offVariation: 0,
        prerequisites: [],
        targets: [],
        contextTargets: []
      }
    ];

    this.environments.next(mockEnvironments);
    this.flags.next(mockFlags);
  }

  // Feature Flag CRUD operations with workspace filtering
  getFlags(): Observable<FeatureFlag[]> {
    return combineLatest([
      this.flags.asObservable(),
      this.workspaceService.getCurrentWorkspace()
    ]).pipe(
      map(([flags, currentWorkspace]) => {
        if (!currentWorkspace) {
          return flags;
        }
        // Filter flags based on current workspace environments
        return flags.filter(flag => 
          flag.environments.some(env => 
            currentWorkspace.environments.includes(env.key)
          )
        );
      })
    );
  }

  getFlag(key: string): Observable<FeatureFlag | undefined> {
    return this.getFlags().pipe(
      map(flags => flags.find(f => f.key === key))
    );
  }

  createFlag(flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>): Observable<FeatureFlag> {
    return this.workspaceService.getCurrentWorkspace().pipe(
      switchMap(currentWorkspace => {
        const newFlag: FeatureFlag = {
          ...flag,
          id: `flag-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const currentFlags = this.flags.value;
        this.flags.next([...currentFlags, newFlag]);
        return of(newFlag);
      })
    );
  }

  updateFlag(key: string, updates: Partial<FeatureFlag>): Observable<FeatureFlag | undefined> {
    const currentFlags = this.flags.value;
    const flagIndex = currentFlags.findIndex(f => f.key === key);
    
    if (flagIndex !== -1) {
      const updatedFlag = {
        ...currentFlags[flagIndex],
        ...updates,
        updatedAt: new Date()
      };
      
      currentFlags[flagIndex] = updatedFlag;
      this.flags.next([...currentFlags]);
      return of(updatedFlag);
    }
    
    return of(undefined);
  }

  deleteFlag(key: string): Observable<boolean> {
    const currentFlags = this.flags.value;
    const filteredFlags = currentFlags.filter(f => f.key !== key);
    
    if (filteredFlags.length !== currentFlags.length) {
      this.flags.next(filteredFlags);
      return of(true);
    }
    
    return of(false);
  }

  // Environment operations
  getEnvironments(): Observable<Environment[]> {
    return combineLatest([
      this.environments.asObservable(),
      this.workspaceService.getCurrentWorkspace()
    ]).pipe(
      map(([environments, currentWorkspace]) => {
        if (!currentWorkspace) {
          return environments;
        }
        // Filter environments based on current workspace
        return environments.filter(env => 
          currentWorkspace.environments.includes(env.key)
        );
      })
    );
  }

  // Flag evaluation
  evaluateFlag(flagKey: string, user: User): Observable<FlagEvaluation | undefined> {
    return this.getFlag(flagKey).pipe(
      map(flag => {
        if (!flag) {
          return undefined;
        }

        // Check if flag is off
        if (flag.offVariation !== undefined) {
          const variation = flag.variations[flag.offVariation];
          return {
            flagKey,
            user,
            value: variation.value,
            variationIndex: flag.offVariation,
            reason: { kind: 'OFF' },
            version: 1,
            trackEvents: false
          };
        }

        // Check prerequisites
        for (const prerequisite of flag.prerequisites) {
          // This would need to evaluate the prerequisite flag
          // For now, we'll assume prerequisites are met
        }

        // Check targets
        for (const target of flag.targets) {
          if (target.values.includes(user.key)) {
            const variation = flag.variations[target.variation];
            return {
              flagKey,
              user,
              value: variation.value,
              variationIndex: target.variation,
              reason: { kind: 'TARGET_MATCH' },
              version: 1,
              trackEvents: true
            };
          }
        }

        // Check rules
        for (let i = 0; i < flag.rules.length; i++) {
          const rule = flag.rules[i];
          if (this.evaluateRule(rule, user)) {
            const variation = flag.variations[rule.variation];
            return {
              flagKey,
              user,
              value: variation.value,
              variationIndex: rule.variation,
              reason: { kind: 'RULE_MATCH', ruleIndex: i, ruleId: rule._id },
              version: 1,
              trackEvents: rule.trackEvents
            };
          }
        }

        // Fallthrough
        const fallthroughVariation = flag.variations[flag.fallthrough.variation];
        return {
          flagKey,
          user,
          value: fallthroughVariation.value,
          variationIndex: flag.fallthrough.variation,
          reason: { kind: 'FALLTHROUGH' },
          version: 1,
          trackEvents: true
        };
      })
    );
  }

  private evaluateRule(rule: any, user: User): boolean {
    return rule.clauses.every((clause: any) => {
      const userValue = this.getUserAttribute(user, clause.attribute);
      return this.evaluateClause(clause, userValue);
    });
  }

  private getUserAttribute(user: User, attribute: string): any {
    switch (attribute) {
      case 'key':
        return user.key;
      case 'email':
        return user.email;
      case 'name':
        return user.name;
      case 'country':
        return user.country;
      default:
        return user.custom?.[attribute];
    }
  }

  private evaluateClause(clause: any, userValue: any): boolean {
    if (clause.op === 'in') {
      const result = clause.values.includes(userValue);
      return clause.negate ? !result : result;
    }
    // Add more operators as needed
    return false;
  }

  getEvaluations(): Observable<FlagEvaluation[]> {
    return this.evaluations.asObservable();
  }

  getFlagAnalytics(flagKey: string): Observable<any> {
    // Mock analytics data
    return of({
      flagKey,
      totalEvaluations: 1250,
      uniqueUsers: 450,
      variations: [
        { value: true, count: 800, percentage: 64 },
        { value: false, count: 450, percentage: 36 }
      ],
      timeSeries: [
        { date: '2024-01-20', evaluations: 120, users: 45 },
        { date: '2024-01-21', evaluations: 135, users: 52 },
        { date: '2024-01-22', evaluations: 110, users: 38 }
      ]
    });
  }
} 