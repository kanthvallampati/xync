import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BannerComponent } from './shared/banner/banner.component';
import { HeaderComponent } from './shared/header/header.component';
import { LucideAngularModule, Plus, Flag, CheckCircle, Clock, Layers, ArrowLeft, TrendingUp, Info, Building2, ChevronDown, Check, Settings, Users, Folder, MoreVertical, ArrowLeftRight, Trash2, UserPlus, Shield, Edit, UserMinus, BarChart3, X, Hourglass } from 'lucide-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BannerComponent, HeaderComponent, LucideAngularModule],
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
