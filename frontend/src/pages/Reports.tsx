import { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Grid,
  Box,
  MenuItem,
  TextField,
} from '@mui/material';
import api from '../services/api';

interface FinancialReport {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export default function Reports() {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadReport();
  }, [year, month]);

  const loadReport = async () => {
    try {
      const response = await api.get(`/reports/financial?year=${year}&month=${month}`);
      setReport(response.data);
    } catch (error) {
      console.error('Error loading report', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        דוחות וניתוחים
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
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
            <Typography variant="h4" color="success.main">₪{report?.totalIncome.toFixed(2) || '0.00'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle1" color="textSecondary">הוצאות (כולל מע"מ)</Typography>
            <Typography variant="h4" color="error.main">₪{report?.totalExpenses.toFixed(2) || '0.00'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle1" color="textSecondary">רווח נקי</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>₪{report?.netProfit.toFixed(2) || '0.00'}</Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Additional report sections can be added here */}
    </Box>
  );
}
