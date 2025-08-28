import React, { useState, useEffect, ReactNode } from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import Card from 'antd/es/card';
import Typography from 'antd/es/typography';
import DatePicker from 'antd/es/date-picker';
import InputNumber from 'antd/es/input-number';
import Select from 'antd/es/select';
import Table from 'antd/es/table';
import Space from 'antd/es/space';
import Divider from 'antd/es/divider';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import Alert from 'antd/es/alert';
import message from 'antd/es/message';
import { 
  PlusOutlined, 
  MinusCircleOutlined, 
  SaveOutlined, 
  ArrowLeftOutlined 
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  addInvoice, 
  editInvoice, 
  fetchInvoice, 
  selectCurrentInvoice, 
  selectInvoiceStatus, 
  selectInvoiceError,
  resetCurrentInvoice
} from '../invoiceSlice';
import { InvoiceItem } from '../invoiceService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Mock clients - replace with actual client data from your store/API
const mockClients = [
  { _id: '1', name: 'Acme Corp', email: 'contact@acme.com' },
  { _id: '2', name: 'Globex Inc', email: 'info@globex.com' },
  { _id: '3', name: 'Soylent Corp', email: 'hello@soylent.com' },
];

const VAT_RATE = 15; // 15% VAT for South Africa

const InvoiceForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  
  const currentInvoice = useAppSelector(selectCurrentInvoice);
  const status = useAppSelector(selectInvoiceStatus);
  const error = useAppSelector(selectInvoiceError);
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { 
      description: '', 
      quantity: 1, 
      unitPrice: 0, 
      vatRate: VAT_RATE, 
      isVATInclusive: true,
      total: 0,
      vatAmount: 0
    }
  ]);
  
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchInvoice(id));
    }
    
    return () => {
      dispatch(resetCurrentInvoice());
    };
  }, [dispatch, id, isEditMode]);
  
  useEffect(() => {
    if (currentInvoice && isEditMode) {
      form.setFieldsValue({
        ...currentInvoice,
        issueDate: dayjs(currentInvoice.issueDate),
        dueDate: dayjs(currentInvoice.dueDate)
      });
      setItems(currentInvoice.items);
    }
  }, [currentInvoice, form, isEditMode]);
  
  const calculateItemTotal = (index: number) => {
    const item = items[index];
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    
    if (item.isVATInclusive) {
      const total = quantity * unitPrice;
      const vatAmount = total * (item.vatRate / (100 + item.vatRate));
      return { vatAmount, total };
    } else {
      const subtotal = quantity * unitPrice;
      const vatAmount = subtotal * (item.vatRate / 100);
      const total = subtotal + vatAmount;
      return { vatAmount, total };
    }
  };
  
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate totals
    const { vatAmount, total } = calculateItemTotal(index);
    newItems[index].total = total;
    newItems[index].vatAmount = vatAmount;
    
    setItems(newItems);
  };
  
  const addItem = () => {
    setItems([
      ...items,
      { 
        description: '', 
        quantity: 1, 
        unitPrice: 0, 
        vatRate: VAT_RATE, 
        isVATInclusive: true,
        total: 0,
        vatAmount: 0
      }
    ]);
  };
  
  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };
  
  const calculateTotals = () => {
    const vatTotal = items.reduce((sum, item) => {
      const { vatAmount } = calculateItemTotal(items.indexOf(item));
      return sum + vatAmount;
    }, 0);
    
    const total = vatTotal;
    
    return { vatTotal, total };
  };
  
  const onFinish = async (values: any) => {
    const { vatTotal, total } = calculateTotals();
    
    const invoiceData = {
      ...values,
      items,
      vatTotal,
      total,
      issueDate: values.issueDate.format('YYYY-MM-DD'),
      dueDate: values.dueDate.format('YYYY-MM-DD'),
      status: 'draft',
    };
    
    try {
      if (isEditMode && id) {
        await dispatch(editInvoice({ id, invoiceData })).unwrap();
        message.success('Invoice updated successfully');
      } else {
        await dispatch(addInvoice(invoiceData)).unwrap();
        message.success('Invoice created successfully');
      }
      navigate('/invoices');
    } catch (err) {
      console.error('Failed to save invoice:', err);
      message.error('Failed to save invoice');
    }
  };
  
  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (_: any, _record: any, index: number) => (
        <Form.Item
          name={['items', index, 'description']}
          rules={[{ required: true, message: 'Required' }]}
          style={{ margin: 0 }}
        >
          <Input
            placeholder="Item description"
            value={items[index]?.description}
            onChange={(e) => updateItem(index, 'description', e.target.value)}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (_: any, _record: any, index: number) => (
        <Form.Item
          name={['items', index, 'quantity']}
          rules={[{ required: true, message: 'Required' }]}
          style={{ margin: 0 }}
        >
          <InputNumber
            min={0.01}
            step={1}
            style={{ width: '100%' }}
            value={items[index]?.quantity}
            onChange={(value) => updateItem(index, 'quantity', value)}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 150,
      render: (_: any, _record: any, index: number) => (
        <Form.Item
          name={['items', index, 'unitPrice']}
          rules={[{ required: true, message: 'Required' }]}
          style={{ margin: 0 }}
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            formatter={value => `R ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value: string | undefined) => Number(value?.replace(/R\s?|(,*)/g, '') || 0)}
            value={items[index]?.unitPrice}
            onChange={(value) => updateItem(index, 'unitPrice', value)}
          />
        </Form.Item>
      ),
    },
    {
      title: 'VAT %',
      dataIndex: 'vatRate',
      key: 'vatRate',
      width: 100,
      render: (_: any, _record: any, index: number) => (
        <Form.Item
          name={['items', index, 'vatRate']}
          style={{ margin: 0 }}
        >
          <InputNumber
            min={0}
            max={100}
            step={0.1}
            style={{ width: '100%' }}
            value={items[index]?.vatRate}
            onChange={(value) => updateItem(index, 'vatRate', value)}
            formatter={value => `${value}%`}
            parser={(value: string | undefined) => Number(value?.replace('%', '') || 0)}
          />
        </Form.Item>
      ),
    },
    {
      title: 'VAT',
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      width: 120,
      render: (_: any, _record: any, index: number) => (
        <div style={{ textAlign: 'right' }}>
          R {calculateItemTotal(index).vatAmount.toFixed(2)}
        </div>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (_: any, _record: any, index: number) => (
        <div style={{ textAlign: 'right' }}>
          R {calculateItemTotal(index).total.toFixed(2)}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, _record: any, index: number) => (
        <Button
          type="text"
          danger
          icon={<MinusCircleOutlined />}
          onClick={() => removeItem(index)}
          disabled={items.length <= 1}
        />
      ),
    },
  ];
  
  const { vatTotal, total } = calculateTotals();
  
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem' }}>
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>
      
      <Card>
        <Title level={3} style={{ marginBottom: 24 }}>
          {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
        </Title>
        
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: 'draft',
            vatRate: VAT_RATE,
            items: [{}],
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Client"
                name="client"
                rules={[{ required: true, message: 'Please select a client' }]}
              >
                <Select
                  showSearch
                  placeholder="Select a client"
                  optionFilterProp="children"
                  filterOption={(input: string, option: { children: ReactNode } | undefined) => {
                    const children = option?.children as string;
                    return children?.toLowerCase().includes(input.toLowerCase()) ?? false;
                  }}
                >
                  {mockClients.map(client => (
                    <Option key={client._id} value={client._id}>
                      {client.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item
                    label="Issue Date"
                    name="issueDate"
                    rules={[{ required: true, message: 'Please select issue date' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item
                    label="Due Date"
                    name="dueDate"
                    rules={[{ required: true, message: 'Please select due date' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          
          <Divider>Invoice Items</Divider>
          
          <Table
            columns={columns}
            dataSource={items}
            pagination={false}
            rowKey={(_, index) => (index ?? 0).toString()}
            footer={() => (
              <Button
                type="dashed"
                onClick={addItem}
                block
                icon={<PlusOutlined />}
              >
                Add Item
              </Button>
            )}
          />
          
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>VAT ({VAT_RATE}%): </Text>
              <Text>R {vatTotal.toFixed(2)}</Text>
            </div>
            <div style={{ marginBottom: 24, fontSize: '1.2em' }}>
              <Text strong>Total: </Text>
              <Text strong>R {total.toFixed(2)}</Text>
            </div>
          </div>
          
          <Form.Item
            label="Notes"
            name="notes"
          >
            <TextArea rows={3} placeholder="Additional notes or terms" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={status === 'loading'}
              >
                {isEditMode ? 'Update Invoice' : 'Create Invoice'}
              </Button>
              <Button onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default InvoiceForm;
