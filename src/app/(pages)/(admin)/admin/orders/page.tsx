'use client';

import { useEffect, useState } from 'react';
import styles from './orders.module.css';
import { OrderType } from '../../../../../validation/order';
import toast from 'react-hot-toast';
import axios from 'axios';
import { DataGrid, GridColDef, GridOverlay, GridToolbar } from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';
import { useRouter } from 'next/navigation';

function Orders() {
  const router = useRouter();

  const [orderCount, setOrderCount] = useState(0);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [filters, setFilters] = useState({
    paymentStatus: 'paid',
    orderStatus: 'pending',
  });

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // columns defined for the
  const columns: GridColDef[] = [
    { 
      field: '_id', 
      headerName: 'ORDER ID', 
      width: 200,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'userId',
      headerName: 'USER ID',
      width: 200,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'orderStatus',
      headerName: 'ORDER STATUS',
      width: 200,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'paymentStatus',
      headerName: 'PAYMENT',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'createdAt',
      headerName: 'ORDER DATE',
      width: 200,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (timestamp) => {
        const date = new Date(timestamp); 
        const day = String(date.getDate()).padStart(2, '0'); 
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
      }
    },
  ];  

  // function to fetch orders from the api
  async function fetchOrders() {
    setIsLoading(true);

    try {
      const res = await axios.get(
        '/api/admin/orders', {
          params: {
            page: paginationModel.page,
            limit: paginationModel.pageSize,
            ...filters,
          }
        }
      );
      const { orders, orderCount } = res.data;
      setOrders(orders);
      setOrderCount(orderCount);
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);   
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [paginationModel]);

  return (
    <div className={styles.data_grid_container}>
      <div className={styles.filter_container}>
        <div className={styles.form_control}>
          <label htmlFor="orderStatus">Order Status</label>

          <select 
            value={filters.orderStatus}
            onChange={(e) => {
              setFilters((prevState) => {
                return {
                  ...prevState,
                  orderStatus: e.target.value
                }
              })
            }}
          >
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div className={styles.form_control}>
          <label htmlFor="paymentStatus">Payment Status</label>

          <select 
            value={filters.paymentStatus}
            onChange={(e) => {
              setFilters((prevState) => {
                return {
                  ...prevState,
                  paymentStatus: e.target.value
                }
              })
            }}
          >
            <option value="paid">Paid</option>
            <option value="not_paid">Not Paid</option>
          </select>
        </div>

        <button onClick={() => fetchOrders()}>Search</button>
      </div>

      <DataGrid
        getRowId={(row) => row._id}
        rows={orders}
        columns={columns}
        rowCount={orderCount}
        onRowClick={({row}) => router.push(`/admin/orders/${row._id}`)}

        // props for implementing pagination
        paginationMode='server'
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 15, 20]}

        // additional features
        loading={isLoading}
        slots={{
          toolbar: GridToolbar,
          loadingOverlay: () => {
            return (
              <GridOverlay>
                <LinearProgress style={{width: '100%'}} />
              </GridOverlay>
            );
          },
        }}
        sx={{
          '& .MuiDataGrid-root': {
            borderRadius: '8px',
            boxShadow: '1px 1px 4px 0px rgba(0, 0, 0, 0.25)',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#EBEBEB',
            color: 'black',
          },
          '& .MuiDataGrid-cell': {
            backgroundColor: '#FFF',
            color: 'black',
          },
          '& .MuiDataGrid-row': {
            margin: '3px 0',
          },
        }}
      />
    </div>
  );
}

export default Orders;
