import { Component } from 'react';

class ErrorBoundary extends Component {
    state = { hasError: false, error: null };
    
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
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
                 <p>{this.state.error?.message}</p>
                 <button onClick={this.handleRetry}>Retry</button>
               </div>
             );
           }
           return this.props.children;
         }
}
export default ErrorBoundary;