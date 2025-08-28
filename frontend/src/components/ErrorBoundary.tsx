import React, { Component, ErrorInfo, ReactNode } from 'react';
import Result from 'antd/es/result';
import Button from 'antd/es/button';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const DefaultFallback = ({ error, resetError }: { error: Error | null; resetError: () => void }) => {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate('/');
    resetError();
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Result
        status="500"
        title="Oops! Something went wrong"
        subTitle={error?.message || 'An unexpected error occurred'}
        extra={[
          <Button 
            type="primary" 
            key="home" 
            icon={<HomeOutlined />} 
            onClick={handleGoHome}
          >
            Back Home
          </Button>,
          <Button key="retry" onClick={resetError}>
            Try Again
          </Button>,
        ]}
      />
    </div>
  );
};

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return fallback ? (
        <>{fallback}</>
      ) : (
        <DefaultFallback error={error} resetError={this.resetError} />
      );
    }

    return children;
  }
}

export default ErrorBoundary;
