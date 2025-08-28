import React, { useEffect } from 'react';
import Card from 'antd/es/card';
import Typography from 'antd/es/typography';
import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Tag from 'antd/es/tag';
import Divider from 'antd/es/divider';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import Badge from 'antd/es/badge';
import message from 'antd/es/message';
import Alert from 'antd/es/alert';
import Popconfirm from 'antd/es/popconfirm';
import Dropdown from 'antd/es/dropdown';
import Menu from 'antd/es/menu';
import { 
  ArrowLeftOutlined, 
  DownloadOutlined, 
  MailOutlined, 
  PrinterOutlined, 
  CheckCircleOutlined, 
  MoreOutlined 
} from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  fetchInvoice, selectCurrentInvoice, 
  editInvoice, removeInvoice, sendInvoiceEmail 
} from '../invoiceSlice';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const invoice = useAppSelector(selectCurrentInvoice);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchInvoice(id));
    }
  }, [dispatch, id]);

  if (!invoice) return <div>Loading...</div>;
  
  const isOverdue = invoice.status !== 'paid' && dayjs(invoice.dueDate).isBefore(dayjs(), 'day');
  const status = isOverdue ? 'overdue' : invoice.status;
  
  const statusColors = {
    draft: 'default',
    sent: 'blue',
    paid: 'green',
    overdue: 'red',
    cancelled: 'default'
  };

  const handleMarkAsPaid = async () => {
    if (!id) return;
    try {
      await dispatch(editInvoice({ 
        id, 
        invoiceData: { status: 'paid' } 
      })).unwrap();
      message.success('Invoice marked as paid');
      dispatch(fetchInvoice(id));
    } catch (err) {
      message.error('Failed to update status');
    }
  };

  const handleSend = async () => {
    if (!id) return;
    try {
      await dispatch(sendInvoiceEmail({ 
        id, 
        emailData: { 
          to: 'client@example.com', // TODO: Replace with actual client email
          subject: `Invoice #${invoice?.invoiceNumber || ''}`,
          message: 'Please find your invoice attached.'
        } 
      })).unwrap();
      message.success('Invoice sent successfully');
    } catch (err) {
      message.error('Failed to send invoice');
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1rem' }}>
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>
      
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>Invoice #{invoice.invoiceNumber}</Title>
            <Tag color={statusColors[status as keyof typeof statusColors]} style={{ textTransform: 'capitalize' }}>
              {status}
            </Tag>
          </div>
          
          <Space>
            {status !== 'paid' && (
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />}
                onClick={handleMarkAsPaid}
              >
                Mark as Paid
              </Button>
            )}
            <Button icon={<MailOutlined />} onClick={handleSend}>
              Send
            </Button>
            <Button icon={<DownloadOutlined />}>
              Download
            </Button>
          </Space>
        </div>
        
        {isOverdue && (
          <Alert
            message="This invoice is overdue"
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}
        
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Text strong>Bill To:</Text>
            <div>{invoice.client || 'Client Name'}</div>
            <div>client@example.com</div> {/* Placeholder until we have client details */}
          </Col>
          <Col span={12}>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Text strong>Issue Date:</Text>
                <div>{formatDate(invoice.issueDate)}</div>
              </Col>
              <Col span={12}>
                <Text strong>Due Date:</Text>
                <Text type={isOverdue ? 'danger' : undefined}>
                  {formatDate(invoice.dueDate)}
                </Text>
              </Col>
            </Row>
          </Col>
        </Row>
        
        <Divider />
        
        <div style={{ marginBottom: 24 }}>
          {invoice.items?.map((item: any, index: number) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <Text strong>{item.description}</Text>
                <div style={{ color: 'rgba(0,0,0,0.45)' }}>
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                  {item.vatRate ? ` (${item.vatRate}% VAT)` : ''}
                </div>
              </div>
              <Text>{formatCurrency(item.total)}</Text>
            </div>
          ))}
        </div>
        
        <Divider />
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: 8 }}>
            <Text strong>Subtotal: </Text>
            <Text>{formatCurrency(invoice.subtotal)}</Text>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text strong>VAT: </Text>
            <Text>{formatCurrency(invoice.vatTotal)}</Text>
          </div>
          <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
            <Text strong>Total: </Text>
            <Text>{formatCurrency(invoice.total)}</Text>
          </div>
        </div>
        
        {invoice.notes && (
          <div style={{ marginTop: 24, padding: 16, background: '#f9f9f9', borderRadius: 4 }}>
            <Text strong>Notes:</Text>
            <div style={{ whiteSpace: 'pre-line' }}>{invoice.notes}</div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InvoiceDetailPage;
