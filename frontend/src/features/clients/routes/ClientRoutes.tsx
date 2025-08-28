import { Routes, Route } from 'react-router-dom';
import ClientsPage from '../pages/ClientsPage';
import ClientDetailPage from '../pages/ClientDetailPage';
import ClientForm from '../components/ClientForm';

const ClientRoutes = () => {
  return (
    <Routes>
      <Route index element={<ClientsPage />} />
      <Route path="new" element={<ClientForm />} />
      <Route path=":id" element={<ClientDetailPage />} />
      <Route path=":id/edit" element={<ClientForm />} />
    </Routes>
  );
};

export default ClientRoutes;