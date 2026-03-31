import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import { ArrowForward as BackIcon, Add as AddIcon } from '@mui/icons-material';
import { customerService } from '../services/customerService';
import type { Customer, Job, Payment } from '../services/customerService';

interface Props {
  id: string;
  onBack: () => void;
}

export default function CustomerDetails({ id, onBack }: Props) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const [jobFormData, setJobFormData] = useState<Job>({ date: new Date().toISOString().split('T')[0], itemName: '', price: 0 });
  const [paymentFormData, setPaymentFormData] = useState<Payment>({ date: new Date().toISOString().split('T')[0], amount: 0, method: 'מזומן' });

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      const response = await customerService.getById(id);
      setCustomer(response.data);
    } catch (error) {
      console.error('Error loading customer', error);
    }
  };

  const handleAddJob = async () => {
    try {
      await customerService.addJob(id, jobFormData);
      loadCustomer();
      setJobFormData({ date: new Date().toISOString().split('T')[0], itemName: '', price: 0 });
    } catch (error) {
      console.error('Error adding job', error);
    }
  };

  const handleAddPayment = async () => {
    try {
      await customerService.addPayment(id, paymentFormData);
      loadCustomer();
      setPaymentFormData({ date: new Date().toISOString().split('T')[0], amount: 0, method: 'מזומן' });
    } catch (error) {
      console.error('Error adding payment', error);
    }
  };

  const handleCloseCase = async () => {
    try {
      await customerService.close(id);
      loadCustomer();
    } catch (error) {
      console.error('Error closing case', error);
    }
  };

  if (!customer) return <Typography>טוען...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4">{customer.name}</Typography>
        <Box sx={{ flexGrow: 1 }} />
        {!customer.closed && (
          <Button variant="outlined" color="error" onClick={handleCloseCase}>
            סגור תיק לקוח
          </Button>
        )}
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2">סה"כ עבודות</Typography>
            <Typography variant="h6">₪{customer.totalAmount.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2">סה"כ שולם</Typography>
            <Typography variant="h6">₪{customer.totalPaid.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2">הנחה</Typography>
            <Typography variant="h6">₪{customer.discount.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: customer.debt > 0 ? 'error.light' : 'success.light' }}>
            <Typography variant="subtitle2">יתרת חוב</Typography>
            <Typography variant="h6">₪{customer.debt.toFixed(2)}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
          <Tab label="פרטים אישיים" />
          <Tab label="עבודות לביצוע" />
          <Tab label="תשלומים" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="body1"><strong>טלפון:</strong> {customer.phone}</Typography>
          <Typography variant="body1"><strong>אימייל:</strong> {customer.email || 'לא הוזן'}</Typography>
          <Typography variant="body1"><strong>כתובת:</strong> {customer.address || 'לא הוזנה'}</Typography>
        </Paper>
      )}

      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          {!customer.closed && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    label="תיאור העבודה"
                    fullWidth
                    size="small"
                    value={jobFormData.itemName}
                    onChange={(e) => setJobFormData({ ...jobFormData, itemName: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    label="מחיר"
                    type="number"
                    fullWidth
                    size="small"
                    value={jobFormData.price}
                    onChange={(e) => setJobFormData({ ...jobFormData, price: Number(e.target.value) })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    value={jobFormData.date}
                    onChange={(e) => setJobFormData({ ...jobFormData, date: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Button variant="contained" fullWidth startIcon={<AddIcon />} onClick={handleAddJob}>
                    הוסף
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>תאריך</TableCell>
                  <TableCell>תיאור</TableCell>
                  <TableCell>מחיר</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customer.jobs.map((job, index) => (
                  <TableRow key={index}>
                    <TableCell>{job.date}</TableCell>
                    <TableCell>{job.itemName}</TableCell>
                    <TableCell>₪{job.price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tabValue === 2 && (
        <Box sx={{ mt: 2 }}>
          {!customer.closed && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    label="סכום"
                    type="number"
                    fullWidth
                    size="small"
                    value={paymentFormData.amount}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: Number(e.target.value) })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    select
                    label="שיטה"
                    fullWidth
                    size="small"
                    value={paymentFormData.method}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, method: e.target.value })}
                  >
                    <MenuItem value="מזומן">מזומן</MenuItem>
                    <MenuItem value="צ'ק">צ'ק</MenuItem>
                    <MenuItem value="העברה בנקאית">העברה בנקאית</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    value={paymentFormData.date}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, date: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Button variant="contained" fullWidth startIcon={<AddIcon />} onClick={handleAddPayment}>
                    הוסף תשלום
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>תאריך</TableCell>
                  <TableCell>סכום</TableCell>
                  <TableCell>שיטת תשלום</TableCell>
                  <TableCell>פרטים</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customer.payments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>₪{payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{payment.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
