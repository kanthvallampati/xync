// Core Libraries
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// Material UI
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services
import { FeatureFlagService } from '../services/feature-flag.service';
import { Environment, Variation, FlagType } from '../models/feature-flag.model';
import { FLAG_TYPES } from '../../../constants/app.constants';

@Component({
  selector: 'app-flag-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatExpansionModule,
    MatSnackBarModule
  ],
  templateUrl: './flag-editor.component.html',
  styleUrls: ['./flag-editor.component.scss']
})
export class FlagEditorComponent implements OnInit {
  flagForm: FormGroup;
  environments: Environment[] = [];
  loading = false;
  isEditMode = false;
  flagKey: string | null = null;

  flagTypes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private featureFlagService: FeatureFlagService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.flagForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadEnvironments();
    this.checkEditMode();
    this.flagTypes = FLAG_TYPES;
  }

  private createForm(): FormGroup {
    return this.fb.group({
      key: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      name: ['', Validators.required],
      description: [''],
      kind: [FlagType.BOOLEAN, Validators.required],
      temporary: [false],
      tags: [[]],
      variations: this.fb.array([]),
      defaultVariation: [0],
      offVariation: [1],
      usingEnvironmentId: [true],
      usingMobileKey: [false],
      fallthrough: this.fb.group({
        variation: [1]
      })
    });
  }

  private loadEnvironments(): void {
    this.featureFlagService.getEnvironments().subscribe(environments => {
      this.environments = environments;
    });
  }

  private checkEditMode(): void {
    this.flagKey = this.route.snapshot.paramMap.get('key');
    if (this.flagKey) {
      this.isEditMode = true;
      this.loadFlag();
    } else {
      this.initializeDefaultVariations();
    }
  }

  private loadFlag(): void {
    if (!this.flagKey) return;
    
    this.loading = true;
    this.featureFlagService.getFlag(this.flagKey).subscribe(flag => {
      if (flag) {
        this.flagForm.patchValue({
          key: flag.key,
          name: flag.name,
          description: flag.description,
          kind: flag.kind,
          temporary: flag.temporary,
          tags: flag.tags,
          defaultVariation: flag.defaultVariation,
          offVariation: flag.offVariation,
          clientSideAvailability: flag.clientSideAvailability,
          fallthrough: flag.fallthrough
        });
        
        // Set variations
        this.setVariations(flag.variations);
      }
      this.loading = false;
    });
  }

  private initializeDefaultVariations(): void {
    this.setVariations([
      { value: true, name: 'Enabled', _id: 0 },
      { value: false, name: 'Disabled', _id: 1 }
    ]);
  }

  private setVariations(variations: Variation[]): void {
    const variationsArray = this.flagForm.get('variations') as any;
    variationsArray.clear();
    variations.forEach(variation => {
      variationsArray.push(this.fb.group({
        value: [variation.value],
        name: [variation.name || ''],
        _id: [variation._id]
      }));
    });
  }

  get variations() {
    return this.flagForm.get('variations') as any;
  }

  addVariation(): void {
    const variationsArray = this.flagForm.get('variations') as any;
    const newId = variationsArray.length;
    variationsArray.push(this.fb.group({
      value: [''],
      name: [''],
      _id: [newId]
    }));
  }

  removeVariation(index: number): void {
    const variationsArray = this.flagForm.get('variations') as any;
    if (variationsArray.length > 1) {
      variationsArray.removeAt(index);
    }
  }

  onFlagTypeChange(): void {
    const kind = this.flagForm.get('kind')?.value;
    let variations: Variation[] = [];

    switch (kind) {
      case FlagType.BOOLEAN:
        variations = [
          { value: true, name: 'Enabled', _id: 0 },
          { value: false, name: 'Disabled', _id: 1 }
        ];
        break;
      case FlagType.STRING:
        variations = [
          { value: 'option1', name: 'Option 1', _id: 0 },
          { value: 'option2', name: 'Option 2', _id: 1 }
        ];
        break;
      case FlagType.NUMBER:
        variations = [
          { value: 0, name: 'Zero', _id: 0 },
          { value: 1, name: 'One', _id: 1 }
        ];
        break;
      case FlagType.JSON:
        variations = [
          { value: { enabled: true }, name: 'Enabled', _id: 0 },
          { value: { enabled: false }, name: 'Disabled', _id: 1 }
        ];
        break;
    }

    this.setVariations(variations);
  }

  addTag(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      const tags = this.flagForm.get('tags')?.value || [];
      if (!tags.includes(value)) {
        tags.push(value);
        this.flagForm.patchValue({ tags });
      }
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const tags = this.flagForm.get('tags')?.value || [];
    const index = tags.indexOf(tag);
    if (index >= 0) {
      tags.splice(index, 1);
      this.flagForm.patchValue({ tags });
    }
  }

  onSubmit(): void {
    if (this.flagForm.valid) {
      this.loading = true;
      const formValue = this.flagForm.value;
      
      const flagData = {
        ...formValue,
        environments: this.environments,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user@company.com',
        rules: [],
        prerequisites: [],
        targets: [],
        contextTargets: []
      };

      if (this.isEditMode && this.flagKey) {
        this.featureFlagService.updateFlag(this.flagKey, flagData).subscribe(flag => {
          this.loading = false;
          if (flag) {
            this.snackBar.open('Flag updated successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/flags', flag.key]);
          }
        });
      } else {
        this.featureFlagService.createFlag(flagData).subscribe(flag => {
          this.loading = false;
          this.snackBar.open('Flag created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/flags', flag.key]);
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }
} 