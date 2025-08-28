import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from 'antd/es/card';
import Button from 'antd/es/button';
import Tag from 'antd/es/tag';
import Descriptions from 'antd/es/descriptions'; 
import Row from 'antd/es/row'; 
import Col from 'antd/es/col'; 
import Typography from 'antd/es/typography'; 
import Space from 'antd/es/space'; 
import Divider from 'antd/es/divider'; 
import Table from 'antd/es/table'; 
import message from 'antd/es/message';
import Badge from 'antd/es/badge';
import Tabs from 'antd/es/tabs';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  IdcardOutlined,
  BankOutlined
} from '@ant-design/icons';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import { useClients } from '../hooks/useClients';
import { Client } from '../clientTypes';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  
  const { getClient } = useClients();

  useEffect(() => {
    if (id) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const clientData = await getClient(id);
      if (clientData) {
        setClient(clientData);
      }
    } catch (error) {
      message.error('Failed to load client details');
      console.error('Error loading client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/clients');
  };

  if (loading) {
    return <div>Loading client details...</div>;
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  const { 
    name, 
    email, 
    phone, 
    vatNumber, 
    registrationNumber, 
    paymentTerms, 
    notes, 
    address, 
    createdAt, 
    updatedAt 
  } = client;

  const invoiceColumns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text: string) => <Link to={`/invoices/${text}`}>{text}</Link>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Amount',
      dataIndex: 'total',
      key: 'total',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'paid' ? 'success' : status === 'overdue' ? 'error' : 'warning'} 
          text={status.charAt(0).toUpperCase() + status.slice(1)} 
        />
      ),
    },
  ];

  // Mock data - replace with actual data from API
  const invoiceData = [
    {
      key: '1',
      invoiceNumber: 'INV-2023-001',
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      total: 1250.75,
      status: 'pending',
    },
    {
      key: '2',
      invoiceNumber: 'INV-2023-002',
      date: new Date(),
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      total: 1899.99,
      status: 'overdue',
    },
  ];

  return (
    <div className="client-detail-page">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={handleBack}
        style={{ marginBottom: 16 }}
      >
        Back to Clients
      </Button>

      <Card 
        title={
          <Space>
            <Title level={3} style={{ margin: 0 }}>{name}</Title>
            <Tag color="blue">Active</Tag>
          </Space>
        }
        extra={[
          <Button 
            key="edit" 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => navigate(`/clients/${id}/edit`)}
          >
            Edit Client
          </Button>
        ]}
        loading={loading}
      >
        <Tabs defaultActiveKey="details" onChange={setActiveTab}>
          <TabPane tab={
            <span><FileTextOutlined /> Details</span>
          } key="details">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card title="Contact Information" size="small">
                  <Descriptions column={1}>
                    <Descriptions.Item label={
                      <Space><MailOutlined /> Email</Space>
                    }>
                      <a href={`mailto:${email}`}>{email}</a>
                    </Descriptions.Item>
                    
                    {phone && (
                      <Descriptions.Item label={
                        <Space><PhoneOutlined /> Phone</Space>
                      }>
                        <a href={`tel:${phone}`}>{phone}</a>
                      </Descriptions.Item>
                    )}
                    
                    {address && (
                      <Descriptions.Item label={
                        <Space><EnvironmentOutlined /> Address</Space>
                      }>
                        <div>
                          {address.street && <div>{address.street}</div>}
                          <div>
                            {address.city && `${address.city}, `}
                            {address.state && `${address.state} `}
                            {address.postalCode && `${address.postalCode}`}
                          </div>
                          {address.country && <div>{address.country}</div>}
                        </div>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
                
                <Card title="Additional Information" size="small" style={{ marginTop: 16 }}>
                  <Descriptions column={1}>
                    <Descriptions.Item label={
                      <Space><CalendarOutlined /> Member Since</Space>
                    }>
                      {formatDate(createdAt)}
                    </Descriptions.Item>
                    
                    {paymentTerms && (
                      <Descriptions.Item label={
                        <Space><DollarOutlined /> Payment Terms</Space>
                      }>
                        Net {paymentTerms} days
                      </Descriptions.Item>
                    )}
                    
                    {vatNumber && (
                      <Descriptions.Item label={
                        <Space><IdcardOutlined /> VAT Number</Space>
                      }>
                        {vatNumber}
                      </Descriptions.Item>
                    )}
                    
                    {registrationNumber && (
                      <Descriptions.Item label={
                        <Space><BankOutlined /> Registration Number</Space>
                      }>
                        {registrationNumber}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Notes" size="small">
                  {notes ? (
                    <Paragraph>{notes}</Paragraph>
                  ) : (
                    <Text type="secondary">No notes available</Text>
                  )}
                </Card>
                
                <Card 
                  title="Recent Invoices" 
                  size="small" 
                  style={{ marginTop: 16 }}
                  extra={<Link to={`/invoices?clientId=${id}`}>View All</Link>}
                >
                  <Table 
                    columns={invoiceColumns} 
                    dataSource={invoiceData} 
                    pagination={false}
                    size="small"
                    rowKey="invoiceNumber"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane tab={
            <span><DollarOutlined /> Invoices</span>
          } key="invoices">
            <Table 
              columns={invoiceColumns} 
              dataSource={invoiceData} 
              rowKey="invoiceNumber"
            />
          </TabPane>
          
          <TabPane tab={
            <span><CalendarOutlined /> Activity</span>
          } key="activity">
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text type="secondary">Activity log coming soon</Text>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ClientDetailPage;
