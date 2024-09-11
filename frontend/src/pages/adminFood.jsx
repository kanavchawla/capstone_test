// src/components/AdminDashboard.js
import React from 'react';
import { AppBar, Toolbar, Typography, Container, Grid } from '@mui/material';
import OrderTable from './adminFoodTable';

const AdminDashboard = () => {
  return (
    <div>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Admin Dashboard - Food Orders
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
        <Typography variant="h4" gutterBottom>
          Manage Orders
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <OrderTable />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default AdminDashboard;
