import { Routes, Route } from 'react-router-dom';
import InvoicesPage from '../pages/InvoicesPage';
import InvoiceDetailPage from '../pages/InvoiceDetailPage';
import InvoiceForm from '../components/InvoiceForm';

const InvoiceRoutes = () => {
  return (
    <Routes>
      <Route index element={<InvoicesPage />} />
      <Route path="new" element={<InvoiceForm />} />
      <Route path=":id" element={<InvoiceDetailPage />} />
      <Route path=":id/edit" element={<InvoiceForm />} />
    </Routes>
  );
};

export default InvoiceRoutes;