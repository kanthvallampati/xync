// Core Libraries
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material UI
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

// Services
import { FeatureFlagService } from '../modules/flags/services/feature-flag.service';
import { FeatureFlag, Environment } from '../modules/flags/models/feature-flag.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  flags: FeatureFlag[] = [];
  environments: Environment[] = [];
  loading = true;
  selectedEnvironment = 'production';
  displayedColumns = ['key', 'status', 'type', 'environments', 'modified', 'actions'];

  // Analytics data
  totalFlags = 0;
  activeFlags = 0;
  temporaryFlags = 0;
  recentActivity: any[] = [];

  constructor(private featureFlagService: FeatureFlagService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.featureFlagService.getFlags().subscribe(flags => {
      this.flags = flags;
      this.totalFlags = flags.length;
      this.activeFlags = flags.filter(f => f.fallthrough.variation !== undefined).length;
      this.temporaryFlags = flags.filter(f => f.temporary).length;
      this.loading = false;
    });

    this.featureFlagService.getEnvironments().subscribe(environments => {
      this.environments = environments;
    });

    this.featureFlagService.getEvaluations().subscribe(evaluations => {
      this.recentActivity = evaluations.slice(-5).reverse();
    });
  }

  getFlagStatus(flag: FeatureFlag): string {
    return flag.fallthrough.variation !== undefined ? 'active' : 'inactive';
  }

  getFlagStatusColor(flag: FeatureFlag): string {
    return this.getFlagStatus(flag) === 'active' ? 'accent' : 'warn';
  }

  getEnvironmentColor(envKey: string): string {
    const env = this.environments.find(e => e.key === envKey);
    return env?.color || '#666';
  }

  getVariationDisplay(flag: FeatureFlag, variationIndex: number): string {
    const variation = flag.variations[variationIndex];
    return variation.name || String(variation.value);
  }

  deleteFlag(flagKey: string): void {
    if (confirm('Are you sure you want to delete this flag?')) {
      this.featureFlagService.deleteFlag(flagKey).subscribe(success => {
        if (success) {
          this.loadData();
        }
      });
    }
  }
} 