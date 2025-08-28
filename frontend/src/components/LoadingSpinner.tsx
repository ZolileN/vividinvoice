import React from 'react';
import Spin from 'antd/es/spin';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  fullScreen?: boolean;
  tip?: string;
  delay?: number;
  type?: 'default' | 'blur' | 'full';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'default',
  fullScreen = false,
  tip = 'Loading...',
  delay = 300,
  type = 'default',
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const spinProps = {
    indicator: antIcon,
    size,
    tip,
    delay,
    spinning: true,
  };

  const spinner = type === 'blur' ? (
    <div style={{ minHeight: '200px' }}>
      <Spin {...spinProps} />
    </div>
  ) : (
    <Spin {...spinProps} />
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: type === 'blur' ? 'rgba(255, 255, 255, 0.7)' : 'transparent',
        zIndex: 9999,
      }}>
        <Spin {...spinProps} />
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
