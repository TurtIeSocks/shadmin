import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Change this (e.g. the slug) to reset the boundary on navigation. */
  resetKey?: string;
}

interface State {
  error: Error | null;
}

/**
 * Catches render errors thrown by an MDX page so one bad page shows a fallback
 * instead of blanking the whole docs SPA. Resets when `resetKey` changes.
 */
export class MdxErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="not-prose rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-semibold text-foreground mb-1">
            This page failed to render.
          </p>
          <p className="text-sm text-muted-foreground">
            {this.state.error.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
