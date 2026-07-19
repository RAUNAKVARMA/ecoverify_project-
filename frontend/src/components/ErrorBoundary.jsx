import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex min-h-svh max-w-lg flex-col justify-center gap-4 p-6 text-[var(--color-ink)]">
          <p className="font-hand text-2xl text-[var(--color-forest)]">something snagged</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">EcoVerify hit a bump</h1>
          <p className="text-sm leading-relaxed text-[var(--color-ink)]/65">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            className="inline-flex w-fit rounded-full bg-[var(--color-forest)] px-4 py-2 text-sm font-semibold text-[#f7f3f0]"
            onClick={() => {
              this.setState({ error: null })
              window.location.assign('/')
            }}
          >
            Back to Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
