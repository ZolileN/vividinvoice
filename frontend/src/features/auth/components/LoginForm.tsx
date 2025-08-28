import React from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import Card from 'antd/es/card';
import Typography from 'antd/es/typography';
import Alert from 'antd/es/alert';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { login } from '../authSlice';

const { Title, Text } = Typography;

const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await dispatch(login(values)).unwrap();
      // Redirect to dashboard on successful login
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', paddingTop: '5rem' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>Welcome to VividInvoice</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        {error && (
          <Alert
            message="Login Failed"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Sign In
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>
              Don't have an account?{' '}
              <Link to="/register">Register here</Link>
            </Text>
          </div>

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginForm;
