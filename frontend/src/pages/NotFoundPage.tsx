import React from 'react';
import Result from 'antd/es/result';
import Button from 'antd/es/button';
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
          <Button 
            type="primary" 
            onClick={() => navigate('/')}
            children="Back Home"
          />
        }
      />
    </MainLayout>
  );
};

export default NotFoundPage;