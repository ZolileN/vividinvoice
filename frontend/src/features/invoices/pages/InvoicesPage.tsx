import React, { useEffect, useState, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Tag, 
  Row, 
  Col, 
  Input, 
  Select, 
  DatePicker, 
  Dropdown, 
  Menu, 
  Statistic,
  message
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  FilePdfOutlined, 
  MailOutlined, 
  MoreOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  fetchInvoices, 
  selectAllInvoices, 
  selectInvoiceStatus, 
  selectInvoicePagination,
  removeInvoice
} from '../invoiceSlice';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import dayjs, { Dayjs } from 'dayjs';
import { Invoice } from '../invoiceService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface Filters {
  status: string;
  client: string;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  search: string;
}

const InvoicesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const invoices = useAppSelector(selectAllInvoices);
  const status = useAppSelector(selectInvoiceStatus);
  const pagination = useAppSelector(selectInvoicePagination);
  
  const [filters, setFilters] = useState<Filters>({
    status: '',
    client: '',
    dateRange: null,
    search: ''
  });
  
  const loadInvoices = useCallback(() => {
    const params: any = {
      page: pagination.currentPage,
      limit: 10,
      ...(filters.status && { status: filters.status }),
      ...(filters.client && { client: filters.client }),
      ...(filters.search && { search: filters.search }),
    };
    
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
      params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
    }
    
    dispatch(fetchInvoices(params));
  }, [dispatch, filters, pagination.currentPage]);
  
  useEffect(() => {
    loadInvoices();
  }, [loadInvoices, pagination.currentPage]);
  
  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status });
  };
  
  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setFilters({ ...filters, dateRange: dates });
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };
  
  const handleDelete = async (id: string) => {
    try {
      await dispatch(removeInvoice(id)).unwrap();
      message.success('Invoice deleted successfully');
      loadInvoices();
    } catch (err) {
      const error = err as { message?: string };
      message.error(error?.message || 'Failed to delete invoice');
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'overdue':
        return 'error';
      case 'draft':
        return 'default';
      case 'sent':
        return 'processing';
      default:
        return 'default';
    }
  };
  
  const columns = [
    {
      title: 'INVOICE',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text: string, record: any) => (
        <div>
          <Link to={`/invoices/${record._id}`}>
            <Text strong>{text}</Text>
          </Link>
          <div style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>
            {dayjs(record.issueDate).format('MMM D, YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'CLIENT',
      dataIndex: ['client', 'name'],
      key: 'client',
      render: (text: string) => text || 'N/A',
    },
    {
      title: 'DUE DATE',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ textTransform: 'capitalize' }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'TOTAL',
      dataIndex: 'total',
      key: 'total',
      align: 'right' as const,
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="view">
                <Link to={`/invoices/${record._id}`}>View Invoice</Link>
              </Menu.Item>
              <Menu.Item key="edit">
                <Link to={`/invoices/${record._id}/edit`}>Edit</Link>
              </Menu.Item>
              <Menu.Item key="pdf" icon={<FilePdfOutlined />}>
                Download PDF
              </Menu.Item>
              <Menu.Item key="send" icon={<MailOutlined />}>
                Send to Client
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                key="delete" 
                danger
                onClick={() => handleDelete(record._id)}
              >
                Delete
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];
  
// Define the type for the stats object
interface InvoiceStats {
  total: number;
  paid: number;
  overdue: number;
  drafts: number;
}

// Define the initial stats object
const initialStats: InvoiceStats = { total: 0, paid: 0, overdue: 0, drafts: 0 };

// Calculate summary statistics
const stats = invoices.reduce((acc: InvoiceStats, invoice: Invoice) => {
  acc.total += invoice.total;
  if (invoice.status === 'paid') acc.paid += invoice.total;
  if (invoice.status === 'overdue') acc.overdue += invoice.total;
  if (invoice.status === 'draft') acc.drafts++;
  return acc;
}, initialStats);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Invoices</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadInvoices}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/invoices/new')}>
            New Invoice
          </Button>
        </Space>
      </div>
      
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.total}
              precision={2}
              prefix="R"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Paid"
              value={stats.paid}
              precision={2}
              prefix="R"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Overdue"
              value={stats.overdue}
              precision={2}
              prefix="R"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Drafts"
              value={stats.drafts}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Filters */}
      <Card 
        style={{ marginBottom: 24 }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Search invoices..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Status"
              allowClear
              onChange={handleStatusFilter}
              value={filters.status || undefined}
            >
              <Option value="draft">Draft</Option>
              <Option value="sent">Sent</Option>
              <Option value="paid">Paid</Option>
              <Option value="overdue">Overdue</Option>
            </Select>
          </Col>
          <Col xs={12} md={8}>
            <RangePicker 
              style={{ width: '100%' }}
              onChange={handleDateRangeChange}
              value={filters.dateRange}
            />
          </Col>
          <Col xs={24} md={4} style={{ textAlign: 'right' }}>
            <Button type="text" icon={<DownloadOutlined />}>
              Export
            </Button>
          </Col>
        </Row>
      </Card>
      
      {/* Invoices Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="_id"
          loading={status === 'loading'}
          pagination={{
            current: pagination.currentPage,
            pageSize: 10,
            total: pagination.total,
            onChange: (page) => {
              // Handle pagination change
              // Note: The actual pagination handling should be done in the Redux slice
              // This is just a placeholder for the UI
            },
            showSizeChanger: false,
          }}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default InvoicesPage;
