import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Router, RouterModule } from '@angular/router';
import { RouterLink } from '@angular/router';

// Ng-Zorro Modules
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
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

@Component({
 selector: 'landing-page',
  standalone: true,
  imports: [RouterModule, RouterLink,CommonModule,
    NzBreadCrumbModule, NzAvatarModule, NzDropDownModule, NzDividerModule, NzButtonModule, NzIconModule,
    NzMenuModule, NzLayoutModule, NzCarouselModule,
    NzCardModule, NzGridModule, NzInputModule
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})

export class LandingPageComponent implements AfterViewInit {
  @ViewChild('carousel') carousel!: ElementRef;

features = [
  { title: 'Task Management', description: 'Create, assign, and track tasks', img: 'https://cdn.easyfrontend.com/pictures/featured/featured_10_1.png' },
  { title: 'Team Collaboration', description: 'Organize your teams for efficiency', img: 'https://cdn.easyfrontend.com/pictures/featured/featured_10_1.png' },
  { title: 'Timeline View', description: 'Visualize your deadlines and milestones', img: 'https://cdn.easyfrontend.com/pictures/featured/featured_10_1.png'},
  { title: 'Permission Control', description: 'RBAC and role-based access', img: 'https://cdn.easyfrontend.com/pictures/featured/featured_10_1.png' },
];

  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  }

  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  }
  ngAfterViewInit() {
    setInterval(() => this.scrollRight(), 5000); // every 5 sec
    this.carousel.nativeElement.scrollLeft = 0; // Reset position
  }

  constructor(private router: Router) { }
  // Function to navigate to different routes
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // Log actions and navigate accordingly
  log(action: string): void {
    console.log(`${action} clicked`);
    if (action === 'Login') {
      this.router.navigateByUrl('/signin');
    } else if (action === 'Signup') {
      this.router.navigateByUrl('/signup');
    } else if (action === 'GettingStarted') {
      this.router.navigateByUrl('/signup');
    }
  }  
}


