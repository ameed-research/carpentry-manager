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
import type { Supplier, Invoice, DeliveryNote } from '../services/supplierService';
import PaymentDialog from '../components/common/PaymentDialog';
import type { PaymentData } from '../components/common/PaymentDialog';
import InvoiceDialog from '../components/common/InvoiceDialog';
import DeliveryNoteDialog from '../components/common/DeliveryNoteDialog';
import InventoryUploadDialog from '../components/common/InventoryUploadDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { documentService } from '../services/documentService';

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

  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);

  const [dnDialogOpen, setDnDialogOpen] = useState(false);
  const [editingDn, setEditingDn] = useState<DeliveryNote | null>(null);
  const [deleteDnId, setDeleteDnId] = useState<string | null>(null);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

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

  const openInvoiceDialog = (invoice?: Invoice) => {
    setEditingInvoice(invoice || null);
    setInvoiceDialogOpen(true);
  };

  const handleSaveInvoice = async (invoice: Invoice) => {
    try {
      if (editingInvoice && editingInvoice.id) {
        await supplierService.updateInvoice(supplier!.id, editingInvoice.id, invoice);
      } else {
        await supplierService.addInvoice(supplier!.id, invoice);
      }
      setInvoiceDialogOpen(false);
      loadSupplier();
    } catch (error) {
      console.error('Error saving invoice', error);
    }
  };

  const handleDeleteInvoice = async () => {
    if (deleteInvoiceId) {
      try {
        await supplierService.deleteInvoice(supplier!.id, deleteInvoiceId);
        setDeleteInvoiceId(null);
        loadSupplier();
      } catch (error) {
        console.error('Error deleting invoice', error);
      }
    }
  };

  const openDnDialog = (dn?: DeliveryNote) => {
    setEditingDn(dn || null);
    setDnDialogOpen(true);
  };

  const handleSaveDn = async (dn: DeliveryNote) => {
    try {
      if (editingDn && editingDn.id) {
        await supplierService.updateDeliveryNote(supplier!.id, editingDn.id, dn);
      } else {
        await supplierService.addDeliveryNote(supplier!.id, dn);
      }
      setDnDialogOpen(false);
      loadSupplier();
    } catch (error) {
      console.error('Error saving delivery note', error);
    }
  };

  const handleDeleteDn = async () => {
    if (deleteDnId) {
      try {
        await supplierService.deleteDeliveryNote(supplier!.id, deleteDnId);
        setDeleteDnId(null);
        loadSupplier();
      } catch (error) {
        console.error('Error deleting delivery note', error);
      }
    }
  };

  const handleDownloadDocument = (docId: string) => {
    window.open(documentService.getDownloadUrl(docId), '_blank');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isNew) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadDialogOpen(true);
      // Hack to pass the file after a tiny delay so dialog mounts
      setTimeout(() => {
        const dialogInput = document.getElementById('inventory-upload-input') as HTMLInputElement;
        if (dialogInput) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(e.dataTransfer.files[0]);
          dialogInput.files = dataTransfer.files;
          dialogInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 300);
    }
  };

  if (!supplier && !isNew) return <Typography>טוען...</Typography>;

  return (
    <Box sx={{ width: '100%' }} onDragOver={handleDragOver} onDrop={handleDrop}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, width: '100%' }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1, textAlign: 'center' }}>
          {isNew ? 'הוספת ספק חדש' : `${supplier?.name}`}
        </Typography>
      </Box>

      {supplier && !isNew && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">יתרת ספק:</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: (supplier.balance || 0) < 0 ? 'error.main' : 'success.main' }}>
            ₪{(supplier.balance || 0).toFixed(2)}
          </Typography>
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
          <Tab label="נתונים כלליים" />
          <Tab label="תשלומים לספק" disabled={isNew} />
          <Tab label="חשבוניות" disabled={isNew} />
          <Tab label="תעודות משלוח" disabled={isNew} />
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

      {/* Tab 2: Invoices */}
      {tabValue === 2 && !isNew && supplier && (
        <Box sx={{ mt: 2, width: '100%' }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openInvoiceDialog()}>
              הוסף חשבונית ידנית
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ width: '100%' }}>
            <Table sx={{ width: '100%', minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell>מס' חשבונית</TableCell>
                  <TableCell>תאריך חשבונית</TableCell>
                  <TableCell>תאריך קליטה</TableCell>
                  <TableCell>סכום (כולל מע"מ)</TableCell>
                  <TableCell align="center">פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {supplier.invoices?.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoiceId}</TableCell>
                    <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                    <TableCell>{formatDate(invoice.uploadDate)}</TableCell>
                    <TableCell>₪{(invoice.totalAmount || 0).toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {invoice.sourceDocumentId && (
                          <Tooltip title="הורד מסמך מקור">
                            <IconButton size="small" onClick={() => handleDownloadDocument(invoice.sourceDocumentId)}>
                              <DocIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <IconButton size="small" color="primary" onClick={() => openInvoiceDialog(invoice)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteInvoiceId(invoice.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {(!supplier.invoices || supplier.invoices.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">אין חשבוניות רשומות</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Tab 3: Delivery Notes */}
      {tabValue === 3 && !isNew && supplier && (
        <Box sx={{ mt: 2, width: '100%' }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDnDialog()}>
              הוסף תעודת משלוח ידנית
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ width: '100%' }}>
            <Table sx={{ width: '100%', minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell>מס' תעודת משלוח</TableCell>
                  <TableCell>תאריך תעודה</TableCell>
                  <TableCell>תאריך קליטה</TableCell>
                  <TableCell>סכום מוערך</TableCell>
                  <TableCell align="center">פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {supplier.deliveryNotes?.map((dn) => (
                  <TableRow key={dn.id}>
                    <TableCell>{dn.deliveryNoteId}</TableCell>
                    <TableCell>{formatDate(dn.deliveryNoteDate)}</TableCell>
                    <TableCell>{formatDate(dn.uploadDate)}</TableCell>
                    <TableCell>{dn.totalAmount ? `₪${dn.totalAmount.toFixed(2)}` : 'לא צוין'}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {dn.sourceDocumentId && (
                          <Tooltip title="הורד מסמך מקור">
                            <IconButton size="small" onClick={() => handleDownloadDocument(dn.sourceDocumentId)}>
                              <DocIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <IconButton size="small" color="primary" onClick={() => openDnDialog(dn)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteDnId(dn.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {(!supplier.deliveryNotes || supplier.deliveryNotes.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">אין תעודות משלוח רשומות</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Dialog Components */}
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        onSave={handleAddPayment}
        initialData={editingPayment}
      />
      
      <InvoiceDialog
        open={invoiceDialogOpen}
        onClose={() => setInvoiceDialogOpen(false)}
        onSave={handleSaveInvoice}
        initialData={editingInvoice}
      />

      <DeliveryNoteDialog
        open={dnDialogOpen}
        onClose={() => setDnDialogOpen(false)}
        onSave={handleSaveDn}
        initialData={editingDn}
      />

      <InventoryUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSuccess={() => {
          setUploadDialogOpen(false);
          loadSupplier();
        }}
        expectedSupplier={supplier ? { name: supplier.name, taxId: supplier.taxId } : undefined}
      />

      <ConfirmDialog
        open={!!deleteInvoiceId}
        title="מחיקת חשבונית"
        content="האם אתה בטוח שברצונך למחוק חשבונית זו? מחיקת החשבונית תשפיע על יתרת הספק."
        onConfirm={handleDeleteInvoice}
        onCancel={() => setDeleteInvoiceId(null)}
      />

      <ConfirmDialog
        open={!!deleteDnId}
        title="מחיקת תעודת משלוח"
        content="האם אתה בטוח שברצונך למחוק תעודת משלוח זו?"
        onConfirm={handleDeleteDn}
        onCancel={() => setDeleteDnId(null)}
      />
    </Box>
  );
}
