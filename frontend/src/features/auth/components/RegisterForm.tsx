import React from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import Card from 'antd/es/card';
import Typography from 'antd/es/typography';
import Alert from 'antd/es/alert';
import { UserOutlined, MailOutlined, LockOutlined, ShopOutlined, IdcardOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { register } from '../authSlice';

const { Title, Text } = Typography;

const RegisterForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const onFinish = async (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    companyName: string;
    vatNumber: string;
  }, state?: any) => {
    if (values.password !== values.confirmPassword) {
      return;
    }

    try {
      const { confirmPassword, ...registerData } = values;
      await dispatch(register(registerData)).unwrap();
      // Redirect to dashboard on successful registration
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '2rem 0' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>Create Your Account</Title>
          <Text type="secondary">Get started with VividInvoice</Text>
        </div>

        {error && (
          <Alert
            message="Registration Failed"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          scrollToFirstError
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: 'Please input your full name!' },
              { min: 2, message: 'Name must be at least 2 characters long' },
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="John Doe" 
              size="large" 
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="email@example.com" 
              size="large" 
            />
          </Form.Item>

          <Form.Item
            name="companyName"
            label="Company Name"
            rules={[
              { required: true, message: 'Please input your company name!' },
            ]}
          >
            <Input 
              prefix={<ShopOutlined />} 
              placeholder="Acme Inc." 
              size="large" 
            />
          </Form.Item>

          <Form.Item
            name="vatNumber"
            label="VAT Number"
            rules={[
              { required: true, message: 'Please input your VAT number!' },
              { pattern: /^4[0-9]{9}$/, message: 'Please enter a valid South African VAT number' },
            ]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="4123456789" 
              size="large" 
              maxLength={10}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters long' },
            ]}
            hasFeedback
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="••••••••" 
              size="large" 
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password!' },
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
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="••••••••" 
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

export default RegisterForm;
