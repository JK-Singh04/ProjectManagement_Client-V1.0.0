import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzResultModule],
  templateUrl: './forbidden.component.html',
  styleUrls: ['./forbidden.component.scss']
})
export class ForbiddenComponent {
  type: '403' | '404' = '404';

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe(params => {
      if (params['type'] === '403') {
        this.type = '403';
      }
    });
  }

  navigateHome(): void {
    this.router.navigate(['/']); // Redirect to home
  }
}
