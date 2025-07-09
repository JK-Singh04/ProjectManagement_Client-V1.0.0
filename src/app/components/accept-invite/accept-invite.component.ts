import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  standalone: true,
  selector: 'app-accept-invite',
  imports: [CommonModule, NzSpinModule, NzResultModule, NzButtonModule],
  templateUrl: './accept-invite.component.html'
})
export class AcceptInviteComponent implements OnInit {
  inviteData: any;
  loading = true;
  inviteValid = false;
  token: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (this.token) {
      this.http.get(`/api/teams/accept-invite/${this.token}`).subscribe({
        next: (res: any) => {
          this.inviteData = res;
          this.inviteValid = true;
          this.loading = false;
        },
        error: () => {
          this.inviteValid = false;
          this.loading = false;
        }
      });
    } else {
      this.inviteValid = false;
      this.loading = false;
    }
  }

  goToSignup() {
    if (this.token) {
      this.router.navigate(['/signup'], {
        queryParams: { inviteToken: this.token }
      });
    }
  }
}
