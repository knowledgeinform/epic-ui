import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';

export interface InViewportAction {
  target: Element;
  visible: boolean;
  entry: IntersectionObserverEntry;
}

@Directive({
  selector: '[inViewport]',
  standalone: true,
})
export class InViewportDirective implements AfterViewInit, OnChanges, OnDestroy {
  @Input() inViewportOptions: IntersectionObserverInit = { threshold: [0] };

  @Output() inViewportAction = new EventEmitter<InViewportAction>();

  private observer: IntersectionObserver | null = null;
  private hasViewInitialized = false;

  constructor(private readonly elementRef: ElementRef<Element>) {}

  ngAfterViewInit(): void {
    this.hasViewInitialized = true;
    this.createObserver();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inViewportOptions'] && this.hasViewInitialized) {
      this.createObserver();
    }
  }

  ngOnDestroy(): void {
    this.destroyObserver();
  }

  private createObserver(): void {
    this.destroyObserver();

    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        this.inViewportAction.emit({
          target: entry.target,
          visible: entry.isIntersecting,
          entry,
        });
      }
    }, this.inViewportOptions);

    this.observer.observe(this.elementRef.nativeElement);
  }

  private destroyObserver(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
