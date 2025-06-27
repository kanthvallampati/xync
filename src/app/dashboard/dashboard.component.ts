// Core Libraries
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// Material UI
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Lucide Icons
import { LucideAngularModule, Plus, Flag, CheckCircle, Clock, Layers } from 'lucide-angular';

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
    LucideAngularModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  flags: FeatureFlag[] = [];
  environments: Environment[] = [];
  loading = true;
  selectedEnvironment = 'production';

  // Analytics data
  totalFlags = 0;
  activeFlags = 0;
  temporaryFlags = 0;

  // Lucide icons
  readonly PlusIcon = Plus;
  readonly FlagIcon = Flag;
  readonly CheckCircleIcon = CheckCircle;
  readonly ClockIcon = Clock;
  readonly LayersIcon = Layers;

  constructor(
    private featureFlagService: FeatureFlagService, 
    public router: Router
  ) {}

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
  }

  getFlagStatus(flag: FeatureFlag): string {
    return flag.fallthrough.variation !== undefined ? 'active' : 'inactive';
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