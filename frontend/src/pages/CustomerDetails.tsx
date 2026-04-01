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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowForward as BackIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Description as DocIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { customerService } from '../services/customerService';
import type { Customer, Job, Payment } from '../services/customerService';

import PaymentDialog from '../components/common/PaymentDialog';

interface Props {
  id: string;
  onBack: () => void;
}

const ISRAELI_PHONE_REGEX = /^(0[23489]|0[57]\d)\d{7}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function CustomerDetails({ id, onBack }: Props) {
  const isNew = id === 'new';
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Form states
  const [personalData, setPersonalData] = useState({ name: '', phone: '', email: '', address: '', discount: 0 });
  const [jobFormData, setJobFormData] = useState<Job>({ date: new Date().toISOString().split('T')[0], itemName: '', price: 0 });
  const [paymentFormData, setPaymentFormData] = useState<Payment>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    method: 'CASH',
    remarks: '',
    bank: '',
    branch: '',
    account: '',
    chequeNumber: '',
    dueDate: '',
    referenceNumber: '',
  });

  // Popup states
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isNew) {
      loadCustomer();
    }
  }, [id]);

  const loadCustomer = async () => {
    try {
      const response = await customerService.getById(id);
      setCustomer(response.data);
      setPersonalData({
        name: response.data.name,
        phone: response.data.phone,
        email: response.data.email || '',
        address: response.data.address || '',
        discount: response.data.discount,
      });
    } catch (error) {
      console.error('Error loading customer', error);
    }
  };

  const validatePersonal = () => {
    const newErrors: Record<string, string> = {};
    if (!personalData.name) newErrors.name = 'שם הוא חובה';
    if (personalData.name.length > 100) newErrors.name = 'שם חייב להיות עד 100 תווים';
    if (!personalData.phone) newErrors.phone = 'טלפון הוא חובה';
    if (!ISRAELI_PHONE_REGEX.test(personalData.phone)) newErrors.phone = 'מספר טלפון לא תקין';
    if (personalData.email && !EMAIL_REGEX.test(personalData.email)) newErrors.email = 'אימייל לא תקין';
    if (personalData.address && personalData.address.length > 100) newErrors.address = 'כתובת עד 100 תווים';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCustomer = async () => {
    if (!validatePersonal()) return;
    try {
      if (isNew) {
        await customerService.create(personalData);
        onBack();
      } else {
        await customerService.update(id, personalData);
        loadCustomer();
      }
    } catch (error) {
      console.error('Error saving customer', error);
    }
  };

  const handleAddJob = async () => {
    if (!jobFormData.itemName || jobFormData.itemName.length > 150) {
      alert('תיאור עבודה חובה (עד 150 תווים)');
      return;
    }
    if (jobFormData.price < 0) {
      alert('מחיר לא יכול להיות שלילי');
      return;
    }
    try {
      if (editingJobId) {
        await customerService.updateJob(id, editingJobId, jobFormData);
      } else {
        await customerService.addJob(id, jobFormData);
      }
      loadCustomer();
      setJobDialogOpen(false);
      setEditingJobId(null);
      setJobFormData({ date: new Date().toISOString().split('T')[0], itemName: '', price: 0 });
    } catch (error) {
      console.error('Error saving job', error);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק עבודה זו?')) {
      try {
        await customerService.deleteJob(id, jobId);
        loadCustomer();
      } catch (error) {
        console.error('Error deleting job', error);
      }
    }
  };

  const handleAddPayment = async (dataToSave?: Payment) => {
    const data = dataToSave || paymentFormData;
    if (data.amount <= 0) {
      alert('סכום חייב להיות גדול מ-0');
      return;
    }

    try {
      if (editingPaymentId) {
        await customerService.updatePayment(id, editingPaymentId, data);
      } else {
        await customerService.addPayment(id, data);
      }
      loadCustomer();
      setPaymentDialogOpen(false);
      setEditingPaymentId(null);
      setPaymentFormData({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        method: 'CASH',
        remarks: '',
        bank: '',
        branch: '',
        account: '',
        chequeNumber: '',
        dueDate: '',
        referenceNumber: '',
      });
    } catch (error) {
      console.error('Error saving payment', error);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק תשלום זה?')) {
      try {
        await customerService.deletePayment(id, paymentId);
        loadCustomer();
      } catch (error) {
        console.error('Error deleting payment', error);
      }
    }
  };

  const openJobDialog = (job?: Job) => {
    if (job) {
      setJobFormData({ ...job });
      setEditingJobId(job.id || null);
    } else {
      setJobFormData({ date: new Date().toISOString().split('T')[0], itemName: '', price: 0 });
      setEditingJobId(null);
    }
    setJobDialogOpen(true);
  };

  const openPaymentDialog = (payment?: Payment) => {
    if (payment) {
      setPaymentFormData({ ...payment });
      setEditingPaymentId(payment.id || null);
    } else {
      setPaymentFormData({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        method: 'CASH',
        remarks: '',
        bank: '',
        branch: '',
        account: '',
        chequeNumber: '',
        dueDate: '',
        referenceNumber: '',
      });
      setEditingPaymentId(null);
    }
    setPaymentDialogOpen(true);
  };

  const handleCloseCase = async () => {
    if (window.confirm('האם אתה בטוח שברצונך לסגור את תיק הלקוח? לא ניתן יהיה לערוך אותו יותר.')) {
      try {
        await customerService.close(id);
        loadCustomer();
      } catch (error) {
        console.error('Error closing case', error);
      }
    }
  };

  if (!customer && !isNew) return <Typography>טוען...</Typography>;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, width: '100%' }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1, textAlign: 'center' }}>
          {isNew ? 'הוספת לקוח חדש' : `${customer?.name} ${customer?.closed ? '(סגור)' : ''}`}
        </Typography>
        {!isNew && !customer?.closed && (
          <Button variant="outlined" color="error" onClick={handleCloseCase}>
            סגור תיק לקוח
          </Button>
        )}
      </Box>

      {!isNew && customer && (
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
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: customer.debt > 0 ? '#ffebee' : '#e8f5e9' }}>
              <Typography variant="subtitle2">יתרת חוב</Typography>
              <Typography variant="h6" color={customer.debt > 0 ? 'error' : 'success'}>
                ₪{customer.debt.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
          <Tab label="פרטים אישיים" />
          <Tab label="פריטים לעבודה" disabled={isNew} />
          <Tab label="תשלומים" disabled={isNew} />
        </Tabs>
      </Box>

      {/* Tab 0: Personal Details */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="שם לקוח"
                fullWidth
                required
                value={personalData.name}
                error={!!errors.name}
                helperText={errors.name}
                onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
                disabled={customer?.closed}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="טלפון"
                fullWidth
                required
                value={personalData.phone}
                error={!!errors.phone}
                helperText={errors.phone}
                onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                disabled={customer?.closed}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="אימייל"
                fullWidth
                value={personalData.email}
                error={!!errors.email}
                helperText={errors.email}
                onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                disabled={customer?.closed}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="כתובת"
                fullWidth
                value={personalData.address}
                error={!!errors.address}
                helperText={errors.address}
                onChange={(e) => setPersonalData({ ...personalData, address: e.target.value })}
                disabled={customer?.closed}
              />
            </Grid>
            {!customer?.closed && (
              <Grid size={{ xs: 12 }}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveCustomer}>
                  {isNew ? 'שמור לקוח' : 'עדכן פרטים'}
                </Button>
                {isNew && <Typography variant="caption" sx={{ ml: 2, display: 'block', mt: 1 }}>יש לשמור את הלקוח לפני שניתן יהיה להוסיף עבודות או תשלומים.</Typography>}
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {/* Tab 1: Work Items */}
      {tabValue === 1 && !isNew && customer && (
        <Box sx={{ mt: 2, width: '100%' }}>
          {!customer.closed && (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => openJobDialog()}>
                הוסף עבודה
              </Button>
            </Box>
          )}

          <TableContainer component={Paper} sx={{ width: '100%' }}>
            <Table sx={{ width: '100%', minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell>תאריך</TableCell>
                  <TableCell>תיאור</TableCell>
                  <TableCell>מחיר</TableCell>
                  <TableCell align="center">פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customer.jobs.map((job, index) => (
                  <TableRow key={job.id || index}>
                    <TableCell>{formatDate(job.date)}</TableCell>
                    <TableCell>{job.itemName}</TableCell>
                    <TableCell>₪{job.price.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      {!customer.closed && (
                        <>
                          <IconButton size="small" color="primary" onClick={() => openJobDialog(job)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteJob(job.id!)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {customer.jobs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">אין עבודות רשומות</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Grid container spacing={2} justifyContent="flex-end">
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>סה"כ לפני הנחה:</Typography>
                    <Typography>₪{customer.totalAmount.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>הנחה:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        size="small"
                        type="number"
                        value={personalData.discount}
                        disabled={customer.closed}
                        onChange={(e) => setPersonalData({ ...personalData, discount: Number(e.target.value) })}
                        sx={{
                          width: 100,
                          mr: 1,
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: personalData.discount !== customer.discount ? 'error.main' : 'inherit',
                            },
                          },
                        }}
                      />
                      <IconButton
                        onClick={handleSaveCustomer}
                        disabled={customer.closed || personalData.discount === customer.discount}
                        color={personalData.discount !== customer.discount ? 'error' : 'default'}
                      >
                        <SaveIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: 1, pt: 1 }}>
                    <Typography variant="h6">סה"כ לתשלום:</Typography>
                    <Typography variant="h6">₪{(customer.totalAmount - personalData.discount).toFixed(2)}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Tab 2: Payments */}
      {tabValue === 2 && !isNew && customer && (
        <Box sx={{ mt: 2, width: '100%' }}>
          {!customer.closed && (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => openPaymentDialog()}>
                הוסף תשלום
              </Button>
            </Box>
          )}

          <TableContainer component={Paper} sx={{ width: '100%' }}>
            <Table sx={{ width: '100%', minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell>תאריך</TableCell>
                  <TableCell>סכום</TableCell>
                  <TableCell>שיטת תשלום</TableCell>
                  <TableCell>הערות</TableCell>
                  <TableCell>פרטים</TableCell>
                  <TableCell align="center">פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customer.payments.map((payment, index) => (
                  <TableRow key={payment.id || index}>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                    <TableCell>₪{payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {payment.method === 'CASH' ? 'מזומן' :
                        payment.method === 'CHEQUE' ? 'צ\'ק' : 'העברה בנקאית'}
                    </TableCell>
                    <TableCell>{payment.remarks}</TableCell>
                    <TableCell sx={{ maxWidth: 300, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {payment.method === 'CHEQUE' && (
                        <Typography variant="body2">
                          בנק: {payment.bank}, סניף: {payment.branch}, חשבון: {payment.account}, מס' צ'ק: {payment.chequeNumber}, פירעון: {formatDate(payment.dueDate || '')}
                        </Typography>
                      )}
                      {payment.method === 'MONEY_TRANSFER' && (
                        <Typography variant="body2">אסמכתא: {payment.referenceNumber}</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {payment.sourceDocumentId && (
                          <Tooltip title="צפה במסמך מקור">
                            <IconButton size="small">
                              <DocIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {!customer.closed && (
                          <>
                            <IconButton size="small" color="primary" onClick={() => openPaymentDialog(payment)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeletePayment(payment.id!)}>
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {customer.payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">אין תשלומים רשומים</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
              <Box>
                <Typography variant="subtitle2">סה"כ תשלומים שהתקבלו:</Typography>
                <Typography variant="h6">₪{customer.totalPaid.toFixed(2)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">חוב לקוח:</Typography>
                <Typography variant="h6" color={customer.debt > 0 ? 'error' : 'success'}>
                  ₪{customer.debt.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Job Dialog */}
      <Dialog open={jobDialogOpen} onClose={() => setJobDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle align='right'>{editingJobId ? 'עריכת עבודה' : 'הוספת עבודה חדשה'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <TextField
              label="תיאור העבודה"
              fullWidth
              value={jobFormData.itemName}
              onChange={(e) => setJobFormData({ ...jobFormData, itemName: e.target.value })}
              sx={{ mt: 1 }}
            />
            <TextField
              label="מחיר"
              type="number"
              fullWidth
              value={jobFormData.price}
              onChange={(e) => setJobFormData({ ...jobFormData, price: Number(e.target.value) })}
            />
            <TextField
              label="תאריך"
              type="date"
              fullWidth
              value={jobFormData.date}
              onChange={(e) => setJobFormData({ ...jobFormData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleAddJob} variant="contained">שמור</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        onSave={(data) => {
          handleAddPayment(data as any);
        }}
        initialData={editingPaymentId ? (paymentFormData as any) : null}
      />
    </Box>
  );
}
