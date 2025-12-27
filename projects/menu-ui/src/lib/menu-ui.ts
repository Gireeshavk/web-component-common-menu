import { CommonModule } from '@angular/common';
import { ApiService } from './service/api.service';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Router, Route, IsActiveMatchOptions } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MenuItem } from '../models/menuItems.model';
import { CustomTooltipDirective } from './custom-tooltip.directive';

@Component({
  selector: 'lib-menu-ui',
  imports: [
    CommonModule,
    CustomTooltipDirective,
  ],
  templateUrl: './menu-ui.html',
  styleUrls: ['./menu-ui.scss'],
  standalone: true,
})
export class MenuUi implements OnInit {
  private readonly activeToasts = new Set<string>();
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly apiService = inject(ApiService);
  @Input() baseUrl: string = '';          // Base URL for API
  @Input() menuApiUrl: string = '';       // API endpoint for menu
  @Input() params: Record<string, string | number | boolean | null> = {};
  @Input() token: string = '';
  @Input() basePaths: string[] = [];
  menuItems: MenuItem[] = [];
  skeletonItems = Array.from({ length: 10 });
  isLoading: boolean = true;
  isExpanded: boolean = false; // Track expanded/collapsed state
  
  ngOnInit(): void {
    this.fetchMenuData();
  }
  
  toggleMenu(): void {
    this.isExpanded = !this.isExpanded;
  }

  // Check if text is truncated and should show tooltip
  shouldShowTooltip(text: string): boolean {
    if (!this.isExpanded) {
      return true; // Always show tooltip when collapsed
    }
    // Check if text would exceed available width (approximately 140px for text)
    // Rough calculation: 1 character ≈ 8-10px at 14px font size
    const maxChars = Math.floor(140 / 8);
    return text.length > maxChars;
  }

  getTooltipText(item: MenuItem): string {
    if (!this.isExpanded) {
      return item.functionalityName; // Show full name when collapsed
    }
    // When expanded, only show tooltip if text would be truncated
    return this.shouldShowTooltip(item.functionalityName) ? item.functionalityName : '';
  }
  fetchMenuData() {
    this.apiService.post<any>(this.baseUrl, this.menuApiUrl, this.params, this.token).subscribe({
      next: (response: any) => {
        this.menuItems = response.rObj.fetchAllFunctionalityDetails;
        this.menuItems = this.menuItems.filter((item: MenuItem) => item.isModule);
        console.log("Menu Items:", this.menuItems);
         this.isLoading = false;
      },
      error: (error: any) => {
        console.error("Error fetching menu data:", error);
        this.isLoading = false;
      },
      complete: () => {
        console.log("Menu data fetch complete.");
      }
    });
  }
  handleNavigation(item: MenuItem): void {
    let url = item.url;
    if (!url || url.trim() === '' || url === '#') {
      this.showUrlNotFoundPopup(item.functionalityName);
      return;
    };
    // Absolute URL case
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url);
      // Case 1: Same domain as current app → strip domain and navigate internally
      if (parsed.origin === window.location.origin) {
        url = parsed.pathname; // keep only /quotation/... or /products/...
      }
      // Case 2: Quotation/Products path but running on localhost → strip domain
      else if ((parsed.pathname.startsWith(`/${this.basePaths}/`)) && location.hostname === 'localhost') {
        url = parsed.pathname;
        console.log(url);
        
      }
      // Case 3: External URL → redirect fully
      else {
        window.location.href = url;
        return;
      }
    }

    // Internal Angular navigation
    if (this.isValidUrl(url)) {
      this.router.navigate([url]);
    } else {
      this.showUrlNotFoundPopup(item.functionalityName);
    }
  }
  private isValidUrl(url: string): boolean {
    if (!url || url.trim() === '' || url === '#') {
      return false;
    }

    if (url.includes('null') || url.includes('undefined') || url === '/') {
      return false;
    }

    return this.routeExists(url);
  }

  private routeExists(url: string): boolean {
    const routes = this.router.config;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;

    if (!cleanPath) {
      return false;
    }

    return this.checkRouteInConfig(routes, cleanPath);
  }

  private checkRouteInConfig(routes: Route[], path: string): boolean {
    return routes.some(route => {
      if (route.path === path || route.path === '**') {
        return true;
      }
      if (route.children) {
        return this.checkRouteInConfig(route.children, path);
      }
      return false;
    });
  }

  private showUrlNotFoundPopup(functionalityName: string): void {
    if (this.activeToasts.has(functionalityName)) {
      return; // Avoid duplicate toast
    }

    this.activeToasts.add(functionalityName);
    const toastRef = this.toastr.warning(
      `"${functionalityName}" page not available. Contact admin.`,
      'Page Not Found',
      {
        timeOut: 4000,
        progressBar: true,
        closeButton: true,
        positionClass: 'toast-top-right'
      }
    );

    toastRef.onHidden.subscribe(() => {
      this.activeToasts.delete(functionalityName);
    });
  }

  isActiveRoute(url: any): boolean {
    if (!url || url.trim() === '' || url === '#') {
      return false;
    }

    const currentUrl = this.router.url;
    let compareUrl = url;

    // Handle absolute URLs - extract the path for comparison
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const parsed = new URL(url);
        compareUrl = parsed.pathname; // This extracts /reinsurance/ from the full URL

        // Remove trailing slash for better comparison
        if (compareUrl.endsWith('/') && compareUrl !== '/') {
          compareUrl = compareUrl.slice(0, -1);
        }
      } catch (error) {
        console.warn('Error parsing URL for active route check:', error);
        return false;
      }
    }

    // Remove trailing slash from current URL for consistent comparison
    let normalizedCurrentUrl = currentUrl;
    if (normalizedCurrentUrl.endsWith('/') && normalizedCurrentUrl !== '/') {
      normalizedCurrentUrl = normalizedCurrentUrl.slice(0, -1);
    }

    // Handle exact matches
    if (normalizedCurrentUrl === compareUrl) {
      return true;
    }

    // Handle cases where current URL starts with the menu item URL
    // This helps with nested routes like /reinsurance/dashboard matching /reinsurance
    if (normalizedCurrentUrl.startsWith(compareUrl) && compareUrl !== '/') {
      return true;
    }

    // Angular router's isActive method as fallback with the extracted path
    try {
      const matchOptions: IsActiveMatchOptions = {
        paths: 'subset',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored'
      };

      return this.router.isActive(compareUrl, matchOptions);
    } catch (error) {
      console.warn('Error checking active route:', error);
      return false;
    }
  }
  trackByFn(item: MenuItem): number {
    return item.sWAFunctionalityID;
  }
}
