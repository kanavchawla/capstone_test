import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableRow, 
  Button, Dialog, DialogActions, DialogContent, 
  DialogTitle, MenuItem, Select, TextField, Snackbar, 
  Alert 
} from '@mui/material';

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [shopSecret, setShopSecret] = useState('');
  const [shopVerified, setShopVerified] = useState(false);
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [shopId, setShopId] = useState(null);

  // Handle shop secret submission to verify shop and fetch orders
  const handleVerifySecret = () => {
    fetch(`http://localhost:8000/shops/verify-secret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopSecret }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setShopId(data.shopId); // Save the shop ID
          setShopVerified(true);
          fetchOrdersForShop(data.shopId); // Fetch orders for the verified shop
        } else {
          setSnackbarSeverity('error');
          setSnackbarMessage('Invalid shop secret');
          setSnackbarOpen(true);
        }
      })
      .catch(error => {
        setSnackbarSeverity('error');
        setSnackbarMessage('Error verifying shop secret');
        setSnackbarOpen(true);
        console.error('Error verifying shop secret', error);
      });
  };

  // Fetch orders for the specific shop
  const fetchOrdersForShop = (shopId) => {
    fetch(`http://localhost:8000/food-orders/shop/${shopId}`)
      .then(response => response.json())
      .then(data => setOrders(data))
      .catch(error => console.error('Error fetching orders', error));
  };

  // Open dialog to update the order status
  const handleOpen = (order) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setShopSecret(''); // Clear shop secret if needed
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`http://localhost:8000/food-orders/${selectedOrder._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: status,
          shopSecret: shopSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error updating order status: ${response.statusText}`);
      }

      const updatedOrder = await response.json();

      // Process the updated order
      console.log("Order updated successfully", updatedOrder.order);

      // Optionally, update the state/UI here
      setSnackbarSeverity('success');
      setSnackbarMessage('Order status updated successfully');
      setSnackbarOpen(true);

      // Refresh orders
      fetchOrdersForShop(shopId);
      handleClose();
    } catch (error) {
      console.error("Error updating status", error);
      setSnackbarSeverity('error');
      setSnackbarMessage('Error updating order status');
      setSnackbarOpen(true);
    }
  };

  // Handle Snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      {!shopVerified ? (
        <Dialog open={!shopVerified}>
          <DialogTitle>Enter Shop Secret</DialogTitle>
          <DialogContent>
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
            <Button onClick={handleVerifySecret} color="primary">
              Verify and Fetch Orders
            </Button>
          </DialogActions>
        </Dialog>
      ) : (
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
              {orders.map(order => (
                <TableRow key={order._id}>
                  <TableCell>{order._id}</TableCell>
                  <TableCell>{order.shop?.name || 'N/A'}</TableCell>
                  <TableCell>{`${order.user?.firstname || 'N/A'} ${order.user?.lastname || ''}`}</TableCell>
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
      )}
    </>
  );
};

export default OrderTable;
