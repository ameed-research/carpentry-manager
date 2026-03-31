import { useState, useEffect } from 'react';
import { Typography, Grid, Paper, Box } from '@mui/material';
import api from '../services/api';

interface Stats {
  totalItems: number;
  openOrders: number;
  totalCustomerDebt: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        לוח בקרה
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">סה"כ פריטים במלאי</Typography>
            <Typography variant="h3">{stats?.totalItems ?? 0}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">פריטים במלאי נמוך</Typography>
            <Typography variant="h3">{stats?.openOrders ?? 0}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">סה"כ חובות לקוחות</Typography>
            <Typography variant="h3" color="error">₪{stats?.totalCustomerDebt.toFixed(2) ?? '0.00'}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
