import React, { Suspense } from 'react';
import CustomerProfile from '../../../components/profile/wrapper/CustomerProfile';

function CustomerProfilePage() {
  return (
    <Suspense>
      <CustomerProfile />
    </Suspense>
  );
}

export default CustomerProfilePage;
