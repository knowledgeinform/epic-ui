import { computed, inject, Injectable, Signal } from '@angular/core';
import {
  BreakpointObserver,
  BreakpointState,
} from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';

export const LAYOUT_BREAKPOINTS = {
  xs: '(min-width: 0px) and (max-width: 599.98px)',
  sm: '(min-width: 600px) and (max-width: 959.98px)',
  md: '(min-width: 960px) and (max-width: 1279.98px)',
  lg: '(min-width: 1280px) and (max-width: 1919.98px)',
  xl: '(min-width: 1920px) and (max-width: 4999.98px)',

  'lt-sm': '(max-width: 599.98px)',
  'lt-md': '(max-width: 959.98px)',
  'lt-lg': '(max-width: 1279.98px)',
  'lt-xl': '(max-width: 1919.98px)',

  'gt-xs': '(min-width: 600px)',
  'gt-sm': '(min-width: 960px)',
  'gt-md': '(min-width: 1280px)',
  'gt-lg': '(min-width: 1920px)',
} as const;

export type LayoutBreakpoint = keyof typeof LAYOUT_BREAKPOINTS;

const BREAKPOINT_QUERIES = Object.values(LAYOUT_BREAKPOINTS);

@Injectable({
  providedIn: 'root',
})
export class LayoutBreakpointService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  private readonly state = toSignal(
    this.breakpointObserver.observe(BREAKPOINT_QUERIES),
    {
      initialValue: this.getInitialState(),
    },
  );

  /**
   * Synchronous, reactive check suitable for templates:
   *
   *   media.isActive('lt-md')
   */
  isActive(alias: LayoutBreakpoint): boolean {
    return this.state().breakpoints[LAYOUT_BREAKPOINTS[alias]] ?? false;
  }

  /**
   * Useful when TypeScript code needs a signal rather than an immediate value.
   *
   *   readonly isLtMd = media.activeSignal('lt-md');
   */
  activeSignal(alias: LayoutBreakpoint): Signal<boolean> {
    return computed(() => this.isActive(alias));
  }

  private getInitialState(): BreakpointState {
    const breakpoints: Record<string, boolean> = {};
    let matches = false;

    for (const query of BREAKPOINT_QUERIES) {
      const isMatched = this.breakpointObserver.isMatched(query);

      breakpoints[query] = isMatched;
      matches ||= isMatched;
    }

    return {
      matches,
      breakpoints,
    };
  }
}
