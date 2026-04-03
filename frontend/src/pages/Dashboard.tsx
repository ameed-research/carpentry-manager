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

interface ChequeItem {
  dueDate: string;
  amount: number;
  chequeNumber: string;
  customerName: string;
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

function getChequeColor(dueDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  if (due.getTime() < today.getTime()) return 'success.main';
  if (due.getTime() === today.getTime()) return 'error.main';
  return 'text.primary';
}

const YEARS = [2024, 2025, 2026];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function MonthSelector({ year, month, onYearChange, onMonthChange }: {
  year: number; month: number;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, direction: 'rtl' }}>
      <Typography variant="body2" color="textSecondary">:חודש</Typography>
      <TextField select label="חודש" size="small" value={month} onChange={e => onMonthChange(Number(e.target.value))} sx={{ width: 80 }}>
        {MONTHS.map(m => <MenuItem key={m} value={m}>{String(m).padStart(2, '0')}</MenuItem>)}
      </TextField>
      <TextField select label="שנה" size="small" value={year} onChange={e => onYearChange(Number(e.target.value))} sx={{ width: 90 }}>
        {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
      </TextField>
    </Box>
  );
}

function CollapsibleHeader({ title, expanded, onToggle }: { title: string; expanded: boolean; onToggle: () => void }) {
  return (
    <Box
      onClick={onToggle}
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        px: 3,
        py: 1.5,
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 1,
        borderRadius: expanded ? '4px 4px 0 0' : 1,
        direction: 'rtl',
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
      <Typography variant="subtitle1" fontWeight="bold">{expanded ? '−' : '+'}</Typography>
    </Box>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  const [incomeYear, setIncomeYear] = useState(new Date().getFullYear());
  const [incomeMonth, setIncomeMonth] = useState(new Date().getMonth() + 1);
  const [incomeExpanded, setIncomeExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('customerIncome');
  const [summary, setSummary] = useState<MonthlySummary | null>(null);

  const [chequeYear, setChequeYear] = useState(new Date().getFullYear());
  const [chequeMonth, setChequeMonth] = useState(new Date().getMonth() + 1);
  const [chequeExpanded, setChequeExpanded] = useState(true);
  const [cheques, setCheques] = useState<ChequeItem[]>([]);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    api.get(`/reports/monthly-summary?year=${incomeYear}&month=${incomeMonth}`)
      .then(res => setSummary(res.data))
      .catch(console.error);
  }, [incomeYear, incomeMonth]);

  useEffect(() => {
    api.get(`/reports/cheques?year=${chequeYear}&month=${chequeMonth}`)
      .then(res => setCheques(res.data))
      .catch(console.error);
  }, [chequeYear, chequeMonth]);

  const categories: { key: ActiveTab; label: string }[] = [
    { key: 'customerIncome', label: 'הכנסות מלקוחות' },
    { key: 'supplierInvoices', label: 'חובות לספקים' },
    { key: 'supplierPayments', label: 'תשלומים לספקים' },
    { key: 'otherExpenses', label: 'הוצאות אחרות' },
  ];

  const tableHeaderSx = { bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'right' }}>
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

      {/* הכנסות והוצאות חודשיות */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <CollapsibleHeader
          title="הכנסות והוצאות חודשיות"
          expanded={incomeExpanded}
          onToggle={() => setIncomeExpanded(v => !v)}
        />
        <Collapse in={incomeExpanded}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <MonthSelector
                year={incomeYear} month={incomeMonth}
                onYearChange={setIncomeYear} onMonthChange={setIncomeMonth}
              />
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
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">{cat.label}</Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {formatPrice(summary?.[cat.key]?.total)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderSx}>תאריך</TableCell>
                    <TableCell sx={tableHeaderSx}>סכום</TableCell>
                    {activeTab === 'customerIncome' && <><TableCell sx={tableHeaderSx}>שיטה</TableCell><TableCell sx={tableHeaderSx}>לקוח</TableCell></>}
                    {activeTab === 'supplierInvoices' && <><TableCell sx={tableHeaderSx}>מספר חשבונית</TableCell><TableCell sx={tableHeaderSx}>ספק</TableCell></>}
                    {activeTab === 'supplierPayments' && <><TableCell sx={tableHeaderSx}>שיטה</TableCell><TableCell sx={tableHeaderSx}>פרטים</TableCell></>}
                    {activeTab === 'otherExpenses' && <><TableCell sx={tableHeaderSx}>עבור</TableCell><TableCell sx={tableHeaderSx}>מספר חשבונית</TableCell></>}
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

      <Divider sx={{ my: 4 }} />

      {/* בקרת צ'קים */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <CollapsibleHeader
          title="בקרת צ'קים"
          expanded={chequeExpanded}
          onToggle={() => setChequeExpanded(v => !v)}
        />
        <Collapse in={chequeExpanded}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <MonthSelector
                year={chequeYear} month={chequeMonth}
                onYearChange={setChequeYear} onMonthChange={setChequeMonth}
              />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderSx}>תאריך</TableCell>
                    <TableCell sx={tableHeaderSx}>סכום</TableCell>
                    <TableCell sx={tableHeaderSx}>מספר צ'ק</TableCell>
                    <TableCell sx={tableHeaderSx}>לקוח</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cheques.map((item, i) => {
                    const color = getChequeColor(item.dueDate);
                    return (
                      <TableRow key={i}>
                        <TableCell sx={{ color }}>{formatDate(item.dueDate)}</TableCell>
                        <TableCell sx={{ color }}>{formatPrice(item.amount)}</TableCell>
                        <TableCell sx={{ color }}>{item.chequeNumber}</TableCell>
                        <TableCell sx={{ color }}>{item.customerName}</TableCell>
                      </TableRow>
                    );
                  })}
                  {cheques.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">אין צ'קים לחודש זה</TableCell>
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
