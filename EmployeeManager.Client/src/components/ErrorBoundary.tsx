import { Component, ReactNode, ErrorInfo } from 'react';

interface State {
    hasError: boolean;
    error: Error | null;
}

interface Props {
    children: ReactNode;
}

class ErrorBoundary extends Component<Props, State> {
    state: State = { 
        hasError: false, 
        error: null 
    };
    
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) { // Changed 'any' to 'ErrorInfo' for better TS hygiene
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="max-w-md mx-auto p-6">
                    <div className="card text-center space-y-3">
                        <h2 className="page-title">Something went wrong.</h2>
                        {/* The ?. operator is perfect here because error could be null initially */}
                        <p className="text-muted dark:text-gray-400">{this.state.error?.message}</p>
                        <button onClick={this.handleRetry} className="btn-primary">Retry</button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;