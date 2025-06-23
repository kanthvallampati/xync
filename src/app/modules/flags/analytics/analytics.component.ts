// Core Libraries
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

// Material UI
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

// Services
import { FeatureFlagService } from '../services/feature-flag.service';
import { FeatureFlag, FlagEvaluation } from '../models/feature-flag.model';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  flag: FeatureFlag | undefined;
  analytics: any = {};
  recentEvaluations: FlagEvaluation[] = [];
  loading = true;
  flagKey: string = '';
  Object = Object; // Make Object available in template

  displayedColumns = ['user', 'value', 'reason', 'timestamp'];

  constructor(
    private featureFlagService: FeatureFlagService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.flagKey = this.route.snapshot.paramMap.get('key') || '';
    this.loadAnalytics();
  }

  private loadAnalytics(): void {
    this.featureFlagService.getFlag(this.flagKey).subscribe(flag => {
      this.flag = flag;
      if (flag) {
        this.featureFlagService.getFlagAnalytics(this.flagKey).subscribe(analytics => {
          this.analytics = analytics;
          this.recentEvaluations = analytics.recentEvaluations || [];
          this.loading = false;
        });
      } else {
        this.loading = false;
      }
    });
  }

  getVariationName(variationIndex: number): string {
    if (!this.flag) return '';
    const variation = this.flag.variations[variationIndex];
    return variation.name || String(variation.value);
  }

  getVariationPercentage(count: number): number {
    if (!this.analytics.totalEvaluations) return 0;
    return Math.round((count / this.analytics.totalEvaluations) * 100);
  }

  getReasonDisplay(reason: any): string {
    switch (reason.kind) {
      case 'OFF': return 'Flag Off';
      case 'FALLTHROUGH': return 'Fallthrough';
      case 'RULE_MATCH': return 'Rule Match';
      case 'TARGET_MATCH': return 'Target Match';
      case 'PREREQUISITE_FAILED': return 'Prerequisite Failed';
      default: return reason.kind;
    }
  }

  getReasonColor(reason: any): string {
    switch (reason.kind) {
      case 'OFF': return 'warn';
      case 'FALLTHROUGH': return 'primary';
      case 'RULE_MATCH': return 'accent';
      case 'TARGET_MATCH': return 'accent';
      case 'PREREQUISITE_FAILED': return 'warn';
      default: return 'primary';
    }
  }
} 