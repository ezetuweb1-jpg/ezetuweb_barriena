import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('[ErrorBoundary]', error, info);
  }

  retry = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-screen grid place-items-center p-6 bg-sand-50 dark:bg-slate2-950 text-forest-900 dark:text-sand-100">
        <div className="max-w-md text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-terracotta-100 dark:bg-terracotta-900/30 grid place-items-center mx-auto">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-terracotta-600 dark:text-terracotta-400">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-700">Algo salió mal</h1>
          <p className="text-sm text-forest-700/70 dark:text-sand-300/70">
            Se produjo un error inesperado al cargar la aplicación.
          </p>
          {this.state.error && (
            <pre className="text-[11px] text-terracotta-700 dark:text-terracotta-300/80 bg-forest-50 dark:bg-slate2-900 rounded-xl p-3 overflow-x-auto text-left max-h-32">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.retry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-600 text-white font-600 text-sm hover:bg-forest-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
}
