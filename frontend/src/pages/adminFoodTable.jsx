import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField, Snackbar, Alert } from '@mui/material';

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [shopSecret, setShopSecret] = useState('');
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetch('http://localhost:8000/food-orders')
      .then(response => response.json())
      .then(data => setOrders(data))
      .catch(error => console.error('Error fetching orders', error));
  }, []);

  const handleOpen = (order) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setShopSecret(order.shop?.secret || '');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder) return;

    fetch(`http://localhost:8000/food-orders/${selectedOrder._id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        status,
        shopSecret
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === "Unauthorized to update this order") {
          setSnackbarSeverity('error');
          setSnackbarMessage(data.message);
          setSnackbarOpen(true);
        } else {
          // Update the orders state with the updated order
          setOrders(orders.map(order => order._id === data.order._id ? data.order : order));
          setSnackbarSeverity('success');
          setSnackbarMessage('Order status updated successfully');
          setSnackbarOpen(true);
          handleClose();
        }
      })
      .catch(error => {
        setSnackbarSeverity('error');
        setSnackbarMessage('Error updating status');
        setSnackbarOpen(true);
        console.error('Error updating status', error);
      });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Shop</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell>{order._id}</TableCell>
              <TableCell>{order.shop?.name || 'N/A'}</TableCell>
              <TableCell>{order.user?.firstname || 'N/A'}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>
                <Button variant="contained" color="primary" onClick={() => handleOpen(order)}>
                  Change Status
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Status Update Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="in progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
          <TextField
            label="Shop Secret"
            value={shopSecret}
            onChange={(e) => setShopSecret(e.target.value)}
            fullWidth
            margin="normal"
            type="password"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateStatus} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for error messages */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OrderTable;
