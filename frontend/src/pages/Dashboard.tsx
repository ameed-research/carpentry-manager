import { useState, useEffect } from 'react';
import { Typography, Grid, Paper, Box, TextField, MenuItem, Divider } from '@mui/material';
import api from '../services/api';
import { formatPrice } from '../utils/formatPrice';

interface Stats {
  totalItems: number;
  activeCustomers: number;
  totalCustomerDebt: number;
}

interface FinancialReport {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    api.get(`/reports/financial?year=${year}&month=${month}`)
      .then(res => setReport(res.data))
      .catch(console.error);
  }, [year, month]);

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
            <Typography variant="h6" color="textSecondary">לקוחות פעילים</Typography>
            <Typography variant="h3">{stats?.activeCustomers ?? 0}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">סה"כ חובות לקוחות</Typography>
            <Typography variant="h3" color="error">{formatPrice(stats?.totalCustomerDebt)}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>סיכום פיננסי חודשי</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            select
            label="שנה"
            size="small"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </TextField>
          <TextField
            select
            label="חודש"
            size="small"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle1" color="textSecondary">הכנסות (תשלומים שהתקבלו)</Typography>
            <Typography variant="h4" color="success.main">{formatPrice(report?.totalIncome)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle1" color="textSecondary">הוצאות (כולל מע"מ)</Typography>
            <Typography variant="h4" color="error.main">{formatPrice(report?.totalExpenses)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle1" color="textSecondary">רווח נקי</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{formatPrice(report?.netProfit)}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
