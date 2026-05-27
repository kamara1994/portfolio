'use client'
import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  name?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`ErrorBoundary [${this.props.name || 'unknown'}]:`, error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="px-6 py-8 border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.03)] mx-6 my-4">
          <div className="font-mono text-[9px] text-[#ef4444] tracking-[2px] uppercase mb-2">
            ⚠ Component Error {this.props.name ? `— ${this.props.name}` : ''}
          </div>
          <div className="font-mono text-[10px] text-muted">
            This section encountered an error and could not load.
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="font-mono text-[9px] text-cyan hover:underline mt-2 block"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// Convenience wrapper for functional components
export default function SafeSection({
  children,
  name,
}: {
  children: React.ReactNode
  name?: string
}) {
  return <ErrorBoundary name={name}>{children}</ErrorBoundary>
}
