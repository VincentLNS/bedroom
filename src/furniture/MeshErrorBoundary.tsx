import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  fallback: ReactNode
  children: ReactNode
}

type State = { hasError: boolean }

/** Keeps one broken Kenney mesh from blanking the whole room. */
export class MeshErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[Mini Déco] mesh failed', error.message, info.componentStack)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
