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
  @Input() themeApiUrl: string = '';       // API endpoint for theme
  @Input() logoUrl: string = '';            // Optional: direct logo URL
  @Input() logoText: string = '';           // Optional: text to display with logo
  menuItems: MenuItem[] = [];
  themeData: any;
  logoData: string = '';                    // Logo from themeData API
  skeletonItems = Array.from({ length: 10 });
  isLoading: boolean = true;
  isExpanded: boolean = false; // Track expanded/collapsed state
  @Output() menuToggle = new EventEmitter<boolean>();
  @Output() expandedChange = new EventEmitter<boolean>();
  ngOnInit(): void {
    this.fetchMenuData();
    this.fetchthemeData();
  }
  
 
  toggleMenu(): void {
    this.isExpanded = !this.isExpanded;
    // Emit the state changes
    this.menuToggle.emit(this.isExpanded);
    this.expandedChange.emit(this.isExpanded);
    console.log('Menu toggled:', this.isExpanded); // Add this log
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
    fetchthemeData() {
    if (!this.themeApiUrl) {
      return; // Skip if no theme API URL provided
    }
    this.apiService.post<any>(this.baseUrl, this.themeApiUrl, this.params, this.token).subscribe({
      next: (response: any) => {
        this.themeData = response.rObj.themeConfig;
        // Extract logo from themeData
        if (this.themeData?.defaultLogoByte) {
          // If it's base64, use directly, otherwise convert
          this.logoData = this.themeData.defaultLogoByte.startsWith('data:image') 
            ? this.themeData.defaultLogoByte 
            : `data:image/png;base64,${this.themeData.defaultLogoByte}`;
        }
        console.log("Theme data fetched:", this.themeData);
      },
      error: (error: any) => {
        console.error("Error fetching theme data:", error);
      },
      complete: () => {
        console.log("Theme data fetch complete.");
      }
    });
  }
  // handleNavigation(item: MenuItem): void {
  //   let url = item.url;
  //   if (!url || url.trim() === '' || url === '#') {
  //     this.showUrlNotFoundPopup(item.functionalityName);
  //     return;
  //   };
  //   // Absolute URL case
  //   if (url.startsWith('http://') || url.startsWith('https://')) {
  //     const parsed = new URL(url);
  //     // Case 1: Same domain as current app → strip domain and navigate internally
  //     if (parsed.origin === window.location.origin) {
  //       url = parsed.pathname; // keep only /quotation/... or /products/...
  //     }
  //     // Case 2: Quotation/Products path but running on localhost → strip domain
  //     else if ((parsed.pathname.startsWith(`/${this.basePaths}/`)) && location.hostname === 'localhost') {
  //       url = parsed.pathname;
  //       console.log(url);
        
  //     }
  //     // Case 3: External URL → redirect fully
  //     else {
  //       window.location.href = url;
  //       return;
  //     }
  //   }

  //   // Internal Angular navigation
  //   if (this.isValidUrl(url)) {
  //     this.router.navigate([url]);
  //   } else {
  //     this.showUrlNotFoundPopup(item.functionalityName);
  //   }
  // }
  handleNavigation(item: any): void {
    let url = item.url;
    if (!url || url.trim() === '' || url === '#') {
      this.showUrlNotFoundPopup(item.functionalityName);
      return;
    }
 
    // Absolute URL case
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url);
      let shouldNavigateInternally = false;
 
      // Check if URL matches any base path
      for (const basePath of this.basePaths) {
        // Case 1: Same domain, same base path → strip domain and navigate internally
        if (parsed.origin === window.location.origin &&
            parsed.pathname.startsWith(`/${basePath}/`)) {
          url = parsed.pathname.replace(`/${basePath}/`, '/');
          shouldNavigateInternally = true;
          break;
        }
        // Case 2: localhost development - check if pathname starts with any base path
        // This means the URL is pointing to the same app, just hosted elsewhere
        else if (location.hostname === 'localhost' &&
                 parsed.pathname.startsWith(`/${basePath}/`)) {
          url = parsed.pathname.replace(`/${basePath}/`, '/');
          shouldNavigateInternally = true;
          break;
        }
      }
 
      // Case 3: Different base path or different origin → redirect externally
      if (!shouldNavigateInternally) {
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
   console.log('initall',this.basePaths);
    console.log(compareUrl);
   
    // Handle absolute URLs - extract the path for comparison
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const parsed = new URL(url);
        compareUrl = parsed.pathname;
   
        // For both localhost and hosted: if pathname starts with /products/, strip it
        // This normalizes URLs for comparison with Angular router URLs
        for (const basePath of this.basePaths) {
          if (compareUrl.startsWith(`/${basePath}/`)) {
            compareUrl = compareUrl.replace(`/${basePath}/`, '/');
            break;
          }
        }
 
        // If it's an external URL (different origin and not in basePaths), it can't be active
        const hasBasePath = this.basePaths.some(basePath => url.includes(`/${basePath}/`));
        if (parsed.origin !== window.location.origin && !hasBasePath) {
          return false;
        }
 
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
    // Special handling for Product Config menu item to remain active on related routes
    if (this.basePaths.some(basePath => compareUrl.endsWith(basePath))) {
      const relatedPaths = ['/coverage', '/claim-config', '/parameter', '/installment'];
      if (relatedPaths.some(path => normalizedCurrentUrl.includes(path))) {
        return true;
      }
    }
 
    // Remove trailing slash from compareUrl
    if (compareUrl.endsWith('/') && compareUrl !== '/') {
      compareUrl = compareUrl.slice(0, -1);
    }
      console.log(normalizedCurrentUrl);
      console.log(compareUrl);
 
 
 
    // Handle exact matches
    if (normalizedCurrentUrl === compareUrl) {
      // alert('compareUrl')
      console.log(normalizedCurrentUrl);
     
      return true;
    }
 
    // Handle cases where current URL starts with the menu item URL
    // This helps with nested routes like /product-config/workbench matching /product-config
    if (normalizedCurrentUrl.startsWith(compareUrl + '/') && compareUrl !== '/') {
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
