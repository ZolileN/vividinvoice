import React from 'react';
import { Button } from 'antd';
import Result from 'antd/es/result';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <button 
          className="ant-btn ant-btn-primary"
          onClick={() => navigate('/')}
        >
          <HomeOutlined /> Back Home
        </button>
      }
    />
  );
};

export default UnauthorizedPage;