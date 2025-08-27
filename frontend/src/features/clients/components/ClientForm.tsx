import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Row, Col, Typography, message, Spin, Select, InputNumber } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Client, ClientFormData } from '../clientTypes';
import clientService from '../clientService';
import { useClients } from '../hooks/useClients';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ClientForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { getClient } = useClients();

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const client = await getClient(id);
      if (client) {
        form.setFieldsValue({
          ...client,
          address: client.address || {},
        });
      }
    } catch (error) {
      message.error('Failed to load client data');
      console.error('Error loading client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: ClientFormData) => {
    setSaving(true);
    try {
      const clientData = {
        ...values,
        user: 'current-user-id' // Replace with actual user ID from your auth context
      };
  
      if (isEditMode && id) {
        await clientService.updateClient(id, values);
        message.success('Client updated successfully');
      } else {
        await clientService.createClient(clientData);
        message.success('Client created successfully');
      }
      navigate('/clients');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred';
      message.error(`Failed to save client: ${errorMessage}`);
      console.error('Error saving client:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/clients');
  };

  const initialValues: Partial<ClientFormData> = {
    paymentTerms: 30,
    address: {},
  };

  return (
    <div className="client-form">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={handleBack}
        style={{ marginBottom: 16 }}
      >
        Back to Clients
      </Button>

      <Card>
        <Title level={3} style={{ marginBottom: 24 }}>
          {isEditMode ? 'Edit Client' : 'Add New Client'}
        </Title>

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={initialValues}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Client Name"
                name="name"
                rules={[
                  { required: true, message: 'Please enter client name' },
                  { min: 2, message: 'Name must be at least 2 characters' },
                ]}
              >
                <Input placeholder="Enter client name" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input type="email" placeholder="Enter email address" />
              </Form.Item>

              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  { pattern: /^[0-9+\-\s()]*$/, message: 'Please enter a valid phone number' },
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>

              <Form.Item label="VAT Number" name="vatNumber">
                <Input placeholder="Enter VAT number" />
              </Form.Item>

              <Form.Item label="Registration Number" name="registrationNumber">
                <Input placeholder="Enter registration number" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Title level={5} style={{ marginBottom: 16 }}>Address</Title>
              
              <Form.Item 
                label="Street Address" 
                name={['address', 'street']}
              >
                <Input placeholder="Enter street address" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label="City" 
                    name={['address', 'city']}
                  >
                    <Input placeholder="Enter city" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label="State/Province" 
                    name={['address', 'state']}
                  >
                    <Input placeholder="Enter state/province" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label="Postal Code" 
                    name={['address', 'postalCode']}
                  >
                    <Input placeholder="Enter postal code" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label="Country" 
                    name={['address', 'country']}
                  >
                    <Input placeholder="Enter country" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item 
                label="Payment Terms (days)" 
                name="paymentTerms"
                rules={[
                  { type: 'number', min: 0, message: 'Must be a positive number' },
                ]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item label="Notes" name="notes">
                <TextArea rows={3} placeholder="Enter any additional notes" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={saving}
              style={{ marginRight: 8 }}
            >
              {isEditMode ? 'Update Client' : 'Create Client'}
            </Button>
            <Button onClick={handleBack} disabled={saving}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Spin>
      </Card>
    </div>
  );
};

export default ClientForm;
