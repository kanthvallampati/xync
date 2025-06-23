import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BannerComponent } from './shared/banner/banner.component';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BannerComponent, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  showBanner = false;
  bannerContent = {
    title: 'Welcome to Xync',
    message: 'Feature Flag Management Platform',
    type: 'info'
  }
}
