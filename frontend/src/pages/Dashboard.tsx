import { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Paper,
  Box,
  TextField,
  MenuItem,
  Divider,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import api from '../services/api';
import { formatPrice } from '../utils/formatPrice';

interface Stats {
  totalItems: number;
  activeCustomers: number;
  totalCustomerDebt: number;
}

interface CustomerIncomeItem {
  date: string;
  amount: number;
  method: string;
  customerName: string;
}

interface SupplierInvoiceItem {
  date: string;
  amount: number;
  invoiceId: string;
  supplierName: string;
}

interface SupplierPaymentItem {
  date: string;
  amount: number;
  method: string;
  details: string;
}

interface ExpenseItem {
  date: string;
  amount: number;
  category: string;
  invoiceNumber: string;
}

interface CategoryData<T> {
  total: number;
  items: T[];
}

interface MonthlySummary {
  customerIncome: CategoryData<CustomerIncomeItem>;
  supplierInvoices: CategoryData<SupplierInvoiceItem>;
  supplierPayments: CategoryData<SupplierPaymentItem>;
  otherExpenses: CategoryData<ExpenseItem>;
}

type ActiveTab = 'customerIncome' | 'supplierInvoices' | 'supplierPayments' | 'otherExpenses';

const METHOD_LABELS: Record<string, string> = {
  CASH: 'מזומן',
  CHEQUE: "צ'ק",
  MONEY_TRANSFER: 'העברה בנקאית',
};

function formatDate(iso: string): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${parseInt(day)}.${parseInt(month)}.${year}`;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('customerIncome');
  const [summary, setSummary] = useState<MonthlySummary | null>(null);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    api.get(`/reports/monthly-summary?year=${year}&month=${month}`)
      .then(res => setSummary(res.data))
      .catch(console.error);
  }, [year, month]);

  const categories: { key: ActiveTab; label: string }[] = [
    { key: 'customerIncome', label: 'הכנסות מלקוחות' },
    { key: 'supplierInvoices', label: 'חובות לספקים' },
    { key: 'supplierPayments', label: 'תשלומים לספקים' },
    { key: 'otherExpenses', label: 'הוצאות אחרות' },
  ];

  const getTotal = (tab: ActiveTab): number => {
    if (!summary) return 0;
    return summary[tab]?.total ?? 0;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        לוח בקרה
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">סה"כ פריטים במלאי</Typography>
            <Typography variant="h3">{stats?.totalItems ?? 0}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">לקוחות פעילים</Typography>
            <Typography variant="h3">{stats?.activeCustomers ?? 0}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">סה"כ חובות לקוחות</Typography>
            <Typography variant="h3" color="error">{formatPrice(stats?.totalCustomerDebt)}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            px: 3,
            py: 1.5,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            borderRadius: expanded ? '4px 4px 0 0' : 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            {expanded ? '−' : '+'} הכנסות והוצאות חודשיות
          </Typography>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, justifyContent: 'flex-end' }}>
              <TextField
                select
                label="שנה"
                size="small"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                sx={{ width: 90 }}
              >
                {[2024, 2025, 2026].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
              <TextField
                select
                label="חודש"
                size="small"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                sx={{ width: 80 }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <MenuItem key={m} value={m}>{String(m).padStart(2, '0')}</MenuItem>
                ))}
              </TextField>
              <Typography variant="body2" color="textSecondary">:חודש</Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {categories.map(cat => (
                <Grid key={cat.key} size={{ xs: 6, md: 3 }}>
                  <Box
                    onClick={() => setActiveTab(cat.key)}
                    sx={{
                      border: 2,
                      borderColor: activeTab === cat.key ? 'primary.main' : 'divider',
                      bgcolor: activeTab === cat.key ? 'primary.main' : 'background.paper',
                      color: activeTab === cat.key ? 'white' : 'text.primary',
                      borderRadius: 1,
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">{cat.label}</Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {formatPrice(getTotal(cat.key))}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' } }}>
                    <TableCell>תאריך</TableCell>
                    <TableCell>סכום</TableCell>
                    {activeTab === 'customerIncome' && <><TableCell>שיטה</TableCell><TableCell>לקוח</TableCell></>}
                    {activeTab === 'supplierInvoices' && <><TableCell>מספר חשבונית</TableCell><TableCell>ספק</TableCell></>}
                    {activeTab === 'supplierPayments' && <><TableCell>שיטה</TableCell><TableCell>פרטים</TableCell></>}
                    {activeTab === 'otherExpenses' && <><TableCell>עבור</TableCell><TableCell>מספר חשבונית</TableCell></>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeTab === 'customerIncome' && summary?.customerIncome.items.map((item, i) => (
                    <TableRow key={i} sx={{ bgcolor: i % 2 === 0 ? 'action.hover' : 'background.paper' }}>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>{formatPrice(item.amount)}</TableCell>
                      <TableCell>{METHOD_LABELS[item.method] ?? item.method}</TableCell>
                      <TableCell>{item.customerName}</TableCell>
                    </TableRow>
                  ))}
                  {activeTab === 'supplierInvoices' && summary?.supplierInvoices.items.map((item, i) => (
                    <TableRow key={i} sx={{ bgcolor: i % 2 === 0 ? 'action.hover' : 'background.paper' }}>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>{formatPrice(item.amount)}</TableCell>
                      <TableCell>{item.invoiceId}</TableCell>
                      <TableCell>{item.supplierName}</TableCell>
                    </TableRow>
                  ))}
                  {activeTab === 'supplierPayments' && summary?.supplierPayments.items.map((item, i) => (
                    <TableRow key={i} sx={{ bgcolor: i % 2 === 0 ? 'action.hover' : 'background.paper' }}>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>{formatPrice(item.amount)}</TableCell>
                      <TableCell>{METHOD_LABELS[item.method] ?? item.method}</TableCell>
                      <TableCell>{item.details}</TableCell>
                    </TableRow>
                  ))}
                  {activeTab === 'otherExpenses' && summary?.otherExpenses.items.map((item, i) => (
                    <TableRow key={i} sx={{ bgcolor: i % 2 === 0 ? 'action.hover' : 'background.paper' }}>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>{formatPrice(item.amount)}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.invoiceNumber}</TableCell>
                    </TableRow>
                  ))}
                  {summary && summary[activeTab].items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">אין נתונים לחודש זה</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}
