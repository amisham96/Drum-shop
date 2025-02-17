import ProductsContent from '../../../../components/admin/products/productsContent';
import { Suspense } from 'react';

function AdminProductsPage() {  
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ProductsContent />
    </Suspense>
  );
}

export default AdminProductsPage;