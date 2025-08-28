import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import Card from 'antd/es/card';
import Typography from 'antd/es/typography';
import Statistic from 'antd/es/statistic';
import Table from 'antd/es/table';
import Tag from 'antd/es/tag';
import Button from 'antd/es/button';
import Space from 'antd/es/space';
import message from 'antd/es/message';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  FileTextOutlined, 
  TeamOutlined, 
  CreditCardOutlined,
  DollarOutlined,
  LogoutOutlined 
} from '@ant-design/icons';
import { Bar, Pie } from '@ant-design/charts';
import MainLayout from '../layouts/MainLayout';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useGetMe, useLogout } from '../api/authService';
import LoadingSpinner from '../components/LoadingSpinner';

const { Title, Text } = Typography;

// Mock data - replace with actual API calls
const recentInvoices = [
  { id: 'INV-001', client: 'Acme Corp', date: '2023-05-15', amount: 12500, status: 'paid' },
  { id: 'INV-002', client: 'Globex Inc', date: '2023-05-10', amount: 8750, status: 'pending' },
  { id: 'INV-003', client: 'Soylent Corp', date: '2023-05-05', amount: 15600, status: 'overdue' },
  { id: 'INV-004', client: 'Initech', date: '2023-05-01', amount: 9200, status: 'paid' },
  { id: 'INV-005', client: 'Umbrella Corp', date: '2023-04-28', amount: 11300, status: 'paid' },
];

const revenueData = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 18000 },
  { month: 'Mar', revenue: 15000 },
  { month: 'Apr', revenue: 28000 },
  { month: 'May', revenue: 22000 },
];

const paymentMethodsData = [
  { type: 'Credit Card', value: 45 },
  { type: 'Bank Transfer', value: 30 },
  { type: 'PayFast', value: 15 },
  { type: 'Other', value: 10 },
];

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: userData, isLoading, error } = useGetMe();

  useEffect(() => {
    if (error) {
      message.error('Failed to load user data');
    }
  }, [error]);

    // Fetch dashboard data on component mount
    useEffect(() => {
      // TODO: Fetch dashboard data
    }, [dispatch]);

  const { execute: logout } = useLogout();

  const handleLogout = async () => {
    try {
      await logout();
      message.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      message.error('Failed to log out');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }



  const columns = [
    {
      title: 'Invoice #',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong>R {amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'paid') color = 'success';
        if (status === 'pending') color = 'warning';
        if (status === 'overdue') color = 'error';
        
        return (
          <Tag color={color} style={{ textTransform: 'capitalize' }}>
            {status}
          </Tag>
        );
      },
    },
  ];

  const barConfig = {
    data: revenueData,
    xField: 'revenue',
    yField: 'month',
    seriesField: 'month',
    legend: { position: 'top-left' },
    color: '#1890ff',
    barBackground: { style: { fill: 'rgba(0, 0, 0, 0.1)' } },
    interactions: [{ type: 'active-region' }],
  };

  const pieConfig = {
    data: paymentMethodsData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  return (
    <MainLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 0 }}>Welcome back, {user?.name || 'User'} 👋</Title>
        <Text type="secondary">Here's what's happening with your business today</Text>
        <Button 
          type="text" 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
          style={{ float: 'right' }}
        >
          Logout
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={125600}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarOutlined />}
              suffix="ZAR"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                <ArrowUpOutlined /> 12% increase from last month
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Outstanding Invoices"
              value={8}
              valueStyle={{ color: '#cf1322' }}
              prefix={<FileTextOutlined />}
              suffix="invoices"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                <ArrowUpOutlined /> 2 more than last month
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Clients"
              value={24}
              valueStyle={{ color: '#1890ff' }}
              prefix={<TeamOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                <ArrowUpOutlined /> 4 new this month
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Paid This Month"
              value={85600}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CreditCardOutlined />}
              suffix="ZAR"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                <ArrowDownOutlined /> 5% decrease from last month
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} xl={16}>
          <Card 
            title="Revenue Overview" 
            extra={<a href="/reports/revenue">View Report</a>}
          >
            <Bar {...barConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card 
            title="Payment Methods"
            extra={<a href="/reports/payments">View Details</a>}
          >
            <Pie {...pieConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Recent Invoices" 
        extra={<a href="/invoices">View All</a>}
      >
        <Table 
          columns={columns} 
          dataSource={recentInvoices} 
          rowKey="id"
          pagination={false}
        />
      </Card>
    </MainLayout>
  );
};

export default DashboardPage;
