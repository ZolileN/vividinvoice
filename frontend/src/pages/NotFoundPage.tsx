import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Back Home
          </Button>
        }
      />
    </MainLayout>
  );
};

export default NotFoundPage;
