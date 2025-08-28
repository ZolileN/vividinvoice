import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import Input from 'antd/es/input';
import Space from 'antd/es/space';
import Card from 'antd/es/card';
import Typography from 'antd/es/typography';
import Tag from 'antd/es/tag';
import Badge from 'antd/es/badge';
import Tooltip from 'antd/es/tooltip';
import message from 'antd/es/message';
import Popconfirm from 'antd/es/popconfirm';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { formatDate } from '../../../utils/formatters';
import { useClients } from '../hooks/useClients';
import { Client } from '../clientTypes';

const { Title } = Typography;
const { Search } = Input;

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { 
    clients, 
    loading, 
    error,
    getClients,
    deleteClient,
    search  // This is the correct function name from useClients
  } = useClients();

  useEffect(() => {
    fetchClients();
  }, [pagination.current, pagination.pageSize]);

  const fetchClients = async (search = '') => {
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...(search && { search })
      };
      
      const result = await getClients(params);
      if (result?.pagination) {
        setPagination(prev => ({
          ...prev,
          total: result.pagination.total,
        }));
      }
    } catch (error) {
      message.error('Failed to fetch clients');
      console.error('Error fetching clients:', error);
    }
  };

  const handleSearch = async (value: string) => {
    await search(value);
    setSearchText(value);
    setPagination(prev => ({
      ...prev,
      current: 1, // Reset to first page on new search
    }));
    
    if (value.trim()) {
      search(value);
    } else {
      fetchClients();
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      ...pagination,
      ...newPagination,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClient(id);
      message.success('Client deleted successfully');
      fetchClients(searchText);
    } catch (error) {
      message.error('Failed to delete client');
      console.error('Error deleting client:', error);
    }
  };

  const columns = [
    {
      title: 'Client',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Client) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (record: Client) => (
        <div>
          <div>
            <MailOutlined style={{ marginRight: 8, color: '#666' }} />
            {record.email}
          </div>
          {record.phone && (
            <div>
              <PhoneOutlined style={{ marginRight: 8, color: '#666' }} />
              {record.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (record: Client) => (
        <div>
          {record.address?.city && `${record.address.city}, `}
          {record.address?.country}
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Client) => (
        <Space size="middle">
          <Tooltip title="View">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/clients/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/clients/${record._id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this client?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="clients-page">
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>Clients</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/clients/new')}
          >
            Add Client
          </Button>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Search clients..."
            allowClear
            enterButton={
              <Button type="primary">
                <SearchOutlined />
              </Button>
            }
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            style={{ maxWidth: 400 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={clients}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} clients`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default ClientsPage;
