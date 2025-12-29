import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './service/menu.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'lib-ui-header-lib',
  imports: [CommonModule],
  templateUrl: './ui-header-lib.html',
  styleUrl: './ui-header-lib.scss'
})
export class UiHeaderLib implements OnInit {
  @Input() title: string = '';
  @Input() baseUrl: string = '';          // Base URL for API
  @Input() headerApiUrl: string = '';       // API endpoint for menu
  @Input() params: Record<string, string | number | boolean | null> = {};
  @Input() token: string = '';
  @Input() basePaths: string[] = [];
  @Input() themeApiUrl: string = '';       // API endpoint for theme
  @Input() logoUrl: string = '';            // Optional: direct logo URL
  @Input() logoText: string = ''; 
  isLoading: boolean = true;
  themeData:any;
  logoData: string = '';                    // Logo from themeData API

  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly apiService = inject(ApiService);


  ngOnInit(): void {
    this.fetchMenuData();
    this.fetchthemeData();
  }
   fetchMenuData() {
    this.apiService.post<any>(this.baseUrl, this.headerApiUrl, this.params, this.token).subscribe({
      next: (response: any) => {
        
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
}
