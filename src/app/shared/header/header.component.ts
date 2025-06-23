// Core Libraries
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// Components
import { WorkspaceSelectorComponent } from '../../components/workspace-selector/workspace-selector.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, WorkspaceSelectorComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

} 