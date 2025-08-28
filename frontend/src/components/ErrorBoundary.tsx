import React, { Component, ErrorInfo, ReactNode, ReactElement, ComponentType } from 'react';
import Result from 'antd/es/result';
import Button from 'antd/es/button';
import { HomeOutlined } from '@ant-design/icons';

type FallbackComponent = ComponentType<{ error: Error | null; resetError: () => void }>;
type FallbackElement = ReactElement;
type FallbackRender = (props: { error: Error | null; resetError: () => void }) => ReactNode;

type FallbackType = FallbackComponent | FallbackElement | FallbackRender | null | undefined;

interface Props {
  children: ReactNode;
  fallback?: FallbackType;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const DefaultFallback = ({ error, resetError }: { error: Error | null; resetError: () => void }) => {
  const handleGoHome = () => {
    window.location.href = '/';
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
            Go Home
          </Button>
        ]}
      />
    </div>
  );
};

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private renderFallback(): ReactNode {
    const { fallback } = this.props;
    const { error } = this.state;

    if (!fallback) {
      return <DefaultFallback error={error} resetError={this.resetError} />;
    }

    if (React.isValidElement(fallback)) {
      return fallback;
    }

    if (typeof fallback === 'function') {
      try {
        const result = (fallback as FallbackRender)({ error, resetError: this.resetError });
        return result;
      } catch (e) {
        console.error('Error in fallback render:', e);
        return <DefaultFallback error={error} resetError={this.resetError} />;
      }
    }

    return <DefaultFallback error={error} resetError={this.resetError} />;
  }

  public render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
