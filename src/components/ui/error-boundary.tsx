'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-2 text-gray-500">
                An unexpected error occurred. Please try again or contact support if the problem persists.
              </p>
              {this.state.error && (
                <details className="mb-4 rounded-lg bg-gray-50 p-3 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Error details
                  </summary>
                  <pre className="mt-2 overflow-auto text-xs text-red-600">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={this.handleGoHome}>
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={this.handleReset}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
