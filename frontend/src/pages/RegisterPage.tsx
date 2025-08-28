import React, { useEffect } from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import message from 'antd/es/message';
import Typography from 'antd/es/typography';
import Card from 'antd/es/card';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../api/authService';
import LoadingSpinner from '../components/LoadingSpinner';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { execute: register, isLoading, error } = useRegister();

  useEffect(() => {
    if (error) {
      message.error(error.message || 'Registration failed. Please try again.');
    }
  }, [error]);

  const onFinish = async (values: any) => {
    try {
      await register(values);
      message.success('Registration successful! Please log in.');
      navigate('/login');
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
          maxWidth: 500,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>Create an Account</Title>
          <Text type="secondary">Get started with your free account</Text>
        </div>

        <Form
          form={form}
          name="register"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          scrollToFirstError
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: 'Please input your full name!' },
              { min: 2, message: 'Name must be at least 2 characters' }
            ]}
          >
            <Input placeholder="John Doe" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="email@example.com" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
            hasFeedback
          >
            <Input.Password placeholder="••••••" size="large" />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Please confirm your password!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="••••••" size="large" />
          </Form.Item>

          <Form.Item
            name="companyName"
            label="Company Name (Optional)"
            rules={[
              { max: 100, message: 'Company name must be less than 100 characters' }
            ]}
          >
            <Input placeholder="Acme Inc." size="large" />
          </Form.Item>

          <Form.Item
            name="vatNumber"
            label="VAT Number (Optional)"
            rules={[
              { max: 50, message: 'VAT number must be less than 50 characters' }
            ]}
          >
            <Input placeholder="GB123456789" size="large" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              loading={isLoading}
              style={{ width: '100%' }}
            >
              Create Account
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
