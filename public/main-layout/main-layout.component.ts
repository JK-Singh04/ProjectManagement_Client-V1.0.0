//main-layout.component.ts
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../src/app/shared/services/auth.service';
import { HideIfClaimsNotMetDirective } from '../../src/app/directives/hide-if-claims-not-met.directive';
import { claimReq } from "../../src/app/shared/utils/claimReq-utils";

// Ng-Zorro Modules
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule , NzButtonSize  } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, HideIfClaimsNotMetDirective
    , NzLayoutModule, NzMenuModule, NzBreadCrumbModule, NzButtonModule,
    NzIconModule, NzCarouselModule, NzAvatarModule, NzDropDownModule,
    NzDividerModule, NzCardModule, NzGridModule, NzInputModule,
    NzSwitchModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  isCollapsed = false;
  isDarkMode = false; // Default is Light Mode
  constructor(private router: Router,
    private authService: AuthService) { }

  claimReq = claimReq
  size: NzButtonSize = 'large';
  onLogout() {
    this.authService.deleteToken();
    this.router.navigateByUrl('/signin');
  }
}
