import React, { useState } from 'react';
import Layout from 'antd/es/layout';
import Menu from 'antd/es/menu';
import Button from 'antd/es/button';
import theme from 'antd/es/theme';
import Typography from 'antd/es/typography';
import Dropdown from 'antd/es/dropdown';
import Avatar from 'antd/es/avatar';
import Badge from 'antd/es/badge';
import { 
  DashboardOutlined, 
  FileTextOutlined, 
  TeamOutlined, 
  CreditCardOutlined, 
  SettingOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  BellOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../features/auth/authSlice';
import { useAppNavigation, ROUTES } from '../utils/navigation';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledSider = styled(Sider)`
  background: #fff;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  z-index: 10;
  
  .ant-layout-sider-trigger {
    background: #fff;
    color: #000;
    border-top: 1px solid #f0f0f0;
  }
`;

const Logo = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
  
  h1 {
    color: #1890ff;
    font-size: 18px;
    margin: 0 0 0 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StyledHeader = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 9;
  position: sticky;
  top: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StyledContent = styled(Content)`
  margin: 24px 16px;
  padding: 24px;
  background: #fff;
  min-height: 280px;
  border-radius: 8px;
  overflow: auto;
`;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { goTo } = useAppNavigation();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleLogout = () => {
    dispatch(logout());
    goTo(ROUTES.LOGIN);
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => goTo(ROUTES.PROFILE)}>
        <UserOutlined /> Profile
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        <LogoutOutlined /> Logout
      </Menu.Item>
    </Menu>
  );

  const menuItems = [
    { 
      key: 'dashboard', 
      icon: <DashboardOutlined />, 
      label: 'Dashboard', 
      path: ROUTES.DASHBOARD,
      onClick: () => goTo(ROUTES.DASHBOARD)
    },
    { 
      key: 'invoices', 
      icon: <FileTextOutlined />, 
      label: 'Invoices', 
      path: ROUTES.INVOICES,
      onClick: () => goTo(ROUTES.INVOICES)
    },
    { 
      key: 'clients', 
      icon: <TeamOutlined />, 
      label: 'Clients', 
      path: ROUTES.CLIENTS,
      onClick: () => goTo(ROUTES.CLIENTS)
    },
    { 
      key: 'settings', 
      icon: <SettingOutlined />, 
      label: 'Settings', 
      path: ROUTES.SETTINGS,
      onClick: () => goTo(ROUTES.SETTINGS)
    },
  ];

  const selectedKey = menuItems.find(item => location.pathname.startsWith(item.path))?.key || 'dashboard';

  return (
    <StyledLayout>
      <StyledSider 
        width={220} 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        trigger={null}
      >
        <Logo>
          <h1>{collapsed ? 'VI' : 'VividInvoice'}</h1>
        </Logo>
        
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems.map(item => ({
            ...item,
            onClick: item.onClick,
            label: <span>{item.label}</span>,
          }))}
        />
      </StyledSider>
      
      <Layout>
        <StyledHeader style={{ background: colorBgContainer }}>
          <HeaderLeft>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ marginRight: 16 }}
            />
          </HeaderLeft>
          
          <HeaderRight>
            <Badge count={5}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar 
                  style={{ backgroundColor: '#1890ff' }} 
                  icon={<UserOutlined />} 
                />
                {!collapsed && (
                  <div>
                    <div style={{ fontWeight: 500 }}>{user?.name || 'User'}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {user?.companyName || 'Company'}
                    </Text>
                  </div>
                )}
              </div>
            </Dropdown>
          </HeaderRight>
        </StyledHeader>
        
        <StyledContent>
          {children}
        </StyledContent>
      </Layout>
    </StyledLayout>
  );
};

export default MainLayout;
