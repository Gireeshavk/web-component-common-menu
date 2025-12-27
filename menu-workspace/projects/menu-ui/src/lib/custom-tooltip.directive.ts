import { Directive, ElementRef, Input, Renderer2, OnDestroy } from '@angular/core';

@Directive({
  selector: '[customTooltip]',
  standalone: true
})
export class CustomTooltipDirective implements OnDestroy {
  @Input('customTooltip') tooltipText = '';
  
  private tooltipElement: HTMLElement | null = null;
  private showTimeout: any;
  private hideTimeout: any;

  constructor(
    private readonly elementRef: ElementRef,
    private readonly renderer: Renderer2
  ) {
    this.renderer.listen(this.elementRef.nativeElement, 'mouseenter', () => this.showTooltip());
    this.renderer.listen(this.elementRef.nativeElement, 'mouseleave', () => this.hideTooltip());
  }

  ngOnDestroy() {
    this.clearTimeouts();
    this.removeTooltip();
  }

  private showTooltip() {
    this.clearTimeouts();
    
    this.showTimeout = setTimeout(() => {
      if (!this.tooltipText || this.tooltipElement) return;

      // Create tooltip element
      this.tooltipElement = this.renderer.createElement('div');
      this.renderer.addClass(this.tooltipElement, 'custom-tooltip');
      this.renderer.setProperty(this.tooltipElement, 'textContent', this.tooltipText);

      // Style the tooltip like a dropdown
      this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
      this.renderer.setStyle(this.tooltipElement, 'background-color', '#ffffff');
      this.renderer.setStyle(this.tooltipElement, 'color', '#333333');
      this.renderer.setStyle(this.tooltipElement, 'padding', '8px 12px');
      this.renderer.setStyle(this.tooltipElement, 'border-radius', '6px');
      this.renderer.setStyle(this.tooltipElement, 'font-size', '14px');
      this.renderer.setStyle(this.tooltipElement, 'min-width', '120px');
      this.renderer.setStyle(this.tooltipElement, 'max-width', '250px');
      this.renderer.setStyle(this.tooltipElement, 'word-wrap', 'break-word');
      this.renderer.setStyle(this.tooltipElement, 'z-index', '1000');
      this.renderer.setStyle(this.tooltipElement, 'box-shadow', '0 4px 12px rgba(0, 0, 0, 0.15)');
      this.renderer.setStyle(this.tooltipElement, 'border', '1px solid #e0e0e0');
      this.renderer.setStyle(this.tooltipElement, 'pointer-events', 'none');
      this.renderer.setStyle(this.tooltipElement, 'font-weight', '500');
      this.renderer.setStyle(this.tooltipElement, 'white-space', 'nowrap');
      
      // Add a subtle arrow pointing to the element
      const arrow = this.renderer.createElement('div');
      this.renderer.setStyle(arrow, 'position', 'absolute');
      this.renderer.setStyle(arrow, 'left', '-6px');
      this.renderer.setStyle(arrow, 'top', '50%');
      this.renderer.setStyle(arrow, 'transform', 'translateY(-50%)');
      this.renderer.setStyle(arrow, 'width', '0');
      this.renderer.setStyle(arrow, 'height', '0');
      this.renderer.setStyle(arrow, 'border-top', '6px solid transparent');
      this.renderer.setStyle(arrow, 'border-bottom', '6px solid transparent');
      this.renderer.setStyle(arrow, 'border-right', '6px solid #ffffff');
      this.renderer.appendChild(this.tooltipElement, arrow);

      // Append to body
      this.renderer.appendChild(document.body, this.tooltipElement);

      // Position the tooltip
      this.positionTooltip();
    }, 500); // 500ms delay
  }

  private hideTooltip() {
    this.clearTimeouts();
    
    this.hideTimeout = setTimeout(() => {
      this.removeTooltip();
    }, 100); // Small delay to prevent flickering
  }

  private positionTooltip() {
    if (!this.tooltipElement) return;

    const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    
    // Position to the right of the element like a side dropdown
    let top = hostRect.top + (hostRect.height / 2) - (tooltipRect.height / 2);
    let left = hostRect.right + 12; // 12px gap for the arrow

    // Check if tooltip goes off screen vertically and adjust
    if (top < 8) {
      top = 8;
    } else if (top + tooltipRect.height > window.innerHeight - 8) {
      top = window.innerHeight - tooltipRect.height - 8;
    }

    // Check if tooltip goes off screen horizontally
    if (left + tooltipRect.width > window.innerWidth - 8) {
      // If no space on right, position on left side
      left = hostRect.left - tooltipRect.width - 12;
      
      // Update arrow direction for left positioning
      const arrow = this.tooltipElement.querySelector('div');
      if (arrow) {
        this.renderer.setStyle(arrow, 'left', 'auto');
        this.renderer.setStyle(arrow, 'right', '-6px');
        this.renderer.setStyle(arrow, 'border-right', 'none');
        this.renderer.setStyle(arrow, 'border-left', '6px solid #ffffff');
      }
      
      // If still off screen, keep it within bounds
      if (left < 8) {
        left = 8;
      }
    }

    this.renderer.setStyle(this.tooltipElement, 'top', `${top + window.scrollY}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left + window.scrollX}px`);
  }

  private removeTooltip() {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }

  private clearTimeouts() {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
}