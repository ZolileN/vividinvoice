import React, { useEffect } from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import Card from 'antd/es/card';
import Typography from 'antd/es/typography';
import message from 'antd/es/message';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLogin } from '../api/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import { setCredentials } from '../features/auth/authSlice';
import { useAppDispatch } from '../store/hooks';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { execute: login, isLoading, error } = useLogin();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (error) {
      message.error(error.message || 'Login failed. Please try again.');
    }
  }, [error]);

// In LoginPage.tsx
const onFinish = async (values: any) => {
  try {
    const response = await login(values);
    
    // Save token and user data
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Update Redux store - no need to unwrap here
    dispatch(setCredentials({ user: response.user, token: response.token }));
    
    // Redirect after state is updated
    navigate(from, { replace: true });
    message.success('Login successful!');
  } catch (err) {
    // Error is already handled by the error boundary and interceptors
  }
};

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f2f5',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>Welcome Back</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form
          form={form}
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              loading={isLoading}
              style={{ width: '100%' }}
            >
              Sign In
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>
              Don't have an account?{' '}
              <Link to="/register">Sign up</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
