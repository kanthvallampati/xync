// Core Libraries
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

// Material UI
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Services
import { FeatureFlagService } from '../services/feature-flag.service';
import { FeatureFlag, User, FlagEvaluation } from '../models/feature-flag.model';

@Component({
  selector: 'app-flag-tester',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  templateUrl: './flag-tester.component.html',
  styleUrls: ['./flag-tester.component.scss']
})
export class FlagTesterComponent implements OnInit {
  flag: FeatureFlag | undefined;
  userForm: FormGroup;
  evaluation: FlagEvaluation | undefined;
  loading = false;
  flagKey: string = '';

  constructor(
    private fb: FormBuilder,
    private featureFlagService: FeatureFlagService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    this.flagKey = this.route.snapshot.paramMap.get('key') || '';
    this.loadFlag();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      key: ['test-user', Validators.required],
      name: ['Test User'],
      email: ['test@example.com'],
      country: ['US'],
      subscription: ['basic']
    });
  }

  private loadFlag(): void {
    this.featureFlagService.getFlag(this.flagKey).subscribe(flag => {
      this.flag = flag;
    });
  }

  testFlag(): void {
    if (this.userForm.valid && this.flag) {
      this.loading = true;
      const userData = this.userForm.value;
      
      const user: User = {
        key: userData.key,
        name: userData.name,
        email: userData.email,
        custom: {
          country: userData.country,
          subscription: userData.subscription
        }
      };

      this.featureFlagService.evaluateFlag(this.flagKey, user).subscribe(evaluation => {
        this.evaluation = evaluation;
        this.loading = false;
        
        if (evaluation) {
          this.snackBar.open('Flag evaluated successfully', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getVariationName(variationIndex: number): string {
    if (!this.flag) return '';
    const variation = this.flag.variations[variationIndex];
    return variation.name || String(variation.value);
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