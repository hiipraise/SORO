import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-dvh bg-soro-deep px-6 text-center">
          <div className="mb-6 text-soro-ember/60">
            <AlertTriangle size={48} />
          </div>

          <h1 className="text-xl font-display font-bold text-soro-mist mb-2">
            Something went wrong
          </h1>

          <p className="text-sm text-soro-fade max-w-sm mb-6 leading-relaxed">
            An unexpected error occurred. This doesn't happen often — try
            refreshing the page.
          </p>

          {/* Pull in the SORO brand */}
          <p className="text-xs text-soro-fade/40 mb-8 font-display italic">
            Speak it. Face it. Rise.
          </p>

          <button
            onClick={this.handleReload}
            className="btn-ember inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
          >
            <RefreshCw size={16} />
            Reload the page
          </button>

          {this.state.error && (
            <details className="mt-8 max-w-xs text-left">
              <summary className="text-xs text-soro-fade/40 cursor-pointer hover:text-soro-fade/60 transition-colors">
                Error details
              </summary>
              <p className="text-xs text-soro-fade/30 mt-2 font-mono leading-relaxed break-all">
                {this.state.error.message}
              </p>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
