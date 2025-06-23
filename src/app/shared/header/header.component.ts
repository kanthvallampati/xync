// Core Libraries
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// Components
import { WorkspaceSelectorComponent } from '../../modules/workspaces/workspace-selector/workspace-selector.component';
import { ProjectSelectorComponent } from '../../modules/workspaces/project-selector/project-selector.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, WorkspaceSelectorComponent, ProjectSelectorComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

} 