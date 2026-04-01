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
} from '@mui/material';
import {
  ArrowForward as BackIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Description as DocIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { supplierService } from '../services/supplierService';
import type { Supplier } from '../services/supplierService';
import PaymentDialog from '../components/common/PaymentDialog';
import type { PaymentData } from '../components/common/PaymentDialog';

interface Props {
  id: string; // 'new' if creating a new supplier
  onBack: () => void;
  supplierData?: Supplier | null; // For editing directly from the list without extra fetch if wanted
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

export default function SupplierDetails({ id, onBack, supplierData }: Props) {
  const isNew = id === 'new';
  const [supplier, setSupplier] = useState<Supplier | null>(supplierData || null);
  const [tabValue, setTabValue] = useState(0);

  const [personalData, setPersonalData] = useState({
    name: '',
    phone: '',
    taxId: '',
    contactPerson: '',
    contactPhone: '',
    email: '',
  });

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isNew) {
      setSupplier(null);
    } else {
      loadSupplier();
    }
  }, [id, supplierData]);

  const loadSupplier = async () => {
    try {
      const response = await supplierService.getById(id);
      if (response.data) {
        setSupplier(response.data);
        populatePersonalData(response.data);
      }
    } catch (error) {
      console.error('Error loading supplier', error);
    }
  };

  const populatePersonalData = (data: Supplier) => {
    setPersonalData({
      name: data.name || '',
      phone: data.phone || '',
      taxId: data.taxId || '',
      contactPerson: data.contactPerson || '',
      contactPhone: data.contactPhone || '',
      email: data.email || '',
    });
  };

  const validatePersonal = () => {
    const newErrors: Record<string, string> = {};
    if (!personalData.name) newErrors.name = 'שם הוא חובה';
    if (personalData.name.length > 100) newErrors.name = 'שם חייב להיות עד 100 תווים';
    
    if (!personalData.phone) newErrors.phone = 'טלפון הוא חובה';
    if (personalData.phone && !ISRAELI_PHONE_REGEX.test(personalData.phone)) newErrors.phone = 'מספר טלפון לא תקין';
    
    if (personalData.contactPhone && !ISRAELI_PHONE_REGEX.test(personalData.contactPhone)) newErrors.contactPhone = 'מספר טלפון איש קשר לא תקין';
    if (personalData.contactPerson && personalData.contactPerson.length > 100) newErrors.contactPerson = 'איש קשר עד 100 תווים';

    if (personalData.email && !EMAIL_REGEX.test(personalData.email)) newErrors.email = 'אימייל לא תקין';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSupplier = async () => {
    if (!validatePersonal()) return;
    try {
      if (isNew) {
        await supplierService.create(personalData);
        onBack();
      } else {
        await supplierService.update(id, personalData);
        loadSupplier();
      }
    } catch (error: any) {
      console.error('Error saving supplier', error);
      alert(error.response?.data?.message || 'שגיאה בשמירת ספק');
    }
  };

  const handleAddPayment = async (data: PaymentData) => {
    try {
      if (editingPayment && editingPayment.id) {
        await supplierService.updatePayment(id, editingPayment.id, data);
      } else {
        await supplierService.addPayment(id, data);
      }
      loadSupplier();
      setPaymentDialogOpen(false);
      setEditingPayment(null);
    } catch (error) {
      console.error('Error saving payment', error);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק תשלום זה?')) {
      try {
        await supplierService.deletePayment(id, paymentId);
        loadSupplier();
      } catch (error) {
        console.error('Error deleting payment', error);
      }
    }
  };

  const openPaymentDialog = (payment?: PaymentData) => {
    if (payment) {
      setEditingPayment({ ...payment });
    } else {
      setEditingPayment(null);
    }
    setPaymentDialogOpen(true);
  };

  if (!supplier && !isNew) return <Typography>טוען...</Typography>;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, width: '100%' }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1, textAlign: 'center' }}>
          {isNew ? 'הוספת ספק חדש' : `${supplier?.name}`}
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
          <Tab label="נתונים כלליים" />
          <Tab label="תשלומים לספק" disabled={isNew} />
        </Tabs>
      </Box>

      {/* Tab 0: General Details */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="שם ספק"
                fullWidth
                required
                value={personalData.name}
                error={!!errors.name}
                helperText={errors.name}
                onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="טלפון ראשי"
                fullWidth
                required
                value={personalData.phone}
                error={!!errors.phone}
                helperText={errors.phone}
                onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="ח.פ / ת.ז"
                fullWidth
                value={personalData.taxId}
                onChange={(e) => setPersonalData({ ...personalData, taxId: e.target.value })}
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
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="איש קשר"
                fullWidth
                value={personalData.contactPerson}
                error={!!errors.contactPerson}
                helperText={errors.contactPerson}
                onChange={(e) => setPersonalData({ ...personalData, contactPerson: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="טלפון איש קשר"
                fullWidth
                value={personalData.contactPhone}
                error={!!errors.contactPhone}
                helperText={errors.contactPhone}
                onChange={(e) => setPersonalData({ ...personalData, contactPhone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveSupplier}>
                {isNew ? 'שמור ספק' : 'עדכן פרטים'}
              </Button>
              {isNew && <Typography variant="caption" sx={{ ml: 2, display: 'block', mt: 1 }}>יש לשמור את הספק לפני שניתן יהיה להוסיף תשלומים.</Typography>}
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Tab 1: Payments */}
      {tabValue === 1 && !isNew && supplier && (
        <Box sx={{ mt: 2, width: '100%' }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openPaymentDialog()}>
              הוסף תשלום
            </Button>
          </Box>

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
                {supplier.payments?.map((payment, index) => (
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
                        <IconButton size="small" color="primary" onClick={() => openPaymentDialog(payment)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeletePayment(payment.id!)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {(!supplier.payments || supplier.payments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">אין תשלומים רשומים</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Payment Dialog Component */}
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        onSave={handleAddPayment}
        initialData={editingPayment}
      />
    </Box>
  );
}
