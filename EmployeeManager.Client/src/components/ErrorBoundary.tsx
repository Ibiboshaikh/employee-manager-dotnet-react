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
                <div style={{ padding: 24 }}>
                    <h2>Something went wrong.</h2>
                    {/* The ?. operator is perfect here because error could be null initially */}
                    <p>{this.state.error?.message}</p>
                    <button onClick={this.handleRetry}>Retry</button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;