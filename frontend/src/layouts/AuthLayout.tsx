import React, { ReactNode } from 'react';
import { Layout, Typography } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: #f0f2f5;
`;

const StyledHeader = styled(Header)`
  display: flex;
  align-items: center;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 24px;
  position: relative;
  z-index: 9;
`;

const Logo = styled.div`
  height: 32px;
  margin: 16px 24px 16px 0;
  display: flex;
  align-items: center;
  
  h1 {
    color: #1890ff;
    font-size: 20px;
    margin: 0;
    font-weight: 600;
  }
`;

const StyledContent = styled(Content)`
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StyledFooter = styled(Footer)`
  text-align: center;
  background: transparent;
  padding: 16px 0;
`;

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <StyledLayout>
      <StyledHeader>
        <Logo>
          <Link to="/">
            <h1>VividInvoice</h1>
          </Link>
        </Logo>
      </StyledHeader>
      <StyledContent>
        {children}
      </StyledContent>
      <StyledFooter>
        <Text type="secondary">
          © {new Date().getFullYear()} VividInvoice. All rights reserved.
        </Text>
      </StyledFooter>
    </StyledLayout>
  );
};

export default AuthLayout;
