import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  Typography,
  CircularProgress,
  TextField,
  MenuItem,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Description as DocIcon } from '@mui/icons-material';
import api from '../../services/api';

export interface PaymentData {
  id?: string;
  date: string;
  amount: number;
  method: 'CASH' | 'CHEQUE' | 'MONEY_TRANSFER' | string;
  remarks?: string;
  sourceDocumentId?: string;
  bank?: string;
  branch?: string;
  account?: string;
  chequeNumber?: string;
  dueDate?: string;
  referenceNumber?: string;
}

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (payment: PaymentData) => void;
  initialData?: PaymentData | null;
}

export default function PaymentDialog({ open, onClose, onSave, initialData }: PaymentDialogProps) {
  const isEditing = !!initialData?.id;
  
  const [formData, setFormData] = useState<PaymentData>({
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

  const [paymentFilePreview, setPaymentFilePreview] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    if (open) {
      setPaymentFilePreview(null);
      setIsExtracting(false);
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
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
      }
    }
  }, [open, initialData]);

  const handlePaymentFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processPaymentFile(e.target.files[0]);
    }
  };

  const handlePaymentFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processPaymentFile(e.dataTransfer.files[0]);
    }
  };

  const processPaymentFile = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('יש להעלות קובץ תמונה (JPG, PNG, WEBP) או PDF בלבד.');
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPaymentFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPaymentFilePreview('PDF');
    }

    setIsExtracting(true);
    try {
      const formUpload = new FormData();
      formUpload.append('file', file);
      const response = await api.post<any>('/ai/extract-payment', formUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = response.data;

      setFormData(prev => ({
        ...prev,
        amount: data.amount || prev.amount,
        method: data.method === 'CHEQUE' || data.method === 'MONEY_TRANSFER' || data.method === 'CASH' ? data.method : prev.method,
        bank: data.bank || prev.bank,
        branch: data.branch || prev.branch,
        account: data.account || prev.account,
        chequeNumber: data.chequeNumber || prev.chequeNumber,
        dueDate: data.dueDate || prev.dueDate,
        referenceNumber: data.referenceNumber || prev.referenceNumber,
        remarks: data.remarks || prev.remarks,
      }));
    } catch (error) {
      console.error('Error extracting payment data', error);
      alert('אירעה שגיאה בפיענוח הנתונים. ודא שהגדרת מפתח API של Gemini.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    if (formData.amount <= 0) {
      alert('סכום חייב להיות גדול מ-0');
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={() => { if (!isExtracting) onClose(); }} fullWidth maxWidth="md">
      <DialogTitle sx={{ textAlign: 'right', fontWeight: 'bold' }}>
        {isEditing ? 'עריכת תשלום' : 'הוספת תשלום חדש'}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={4} direction="row-reverse">
          {/* Right Column: Inputs */}
          <Grid size={{ xs: 12, md: !isEditing ? 7 : 12 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="סכום"
                type="number"
                fullWidth
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                disabled={isExtracting}
              />
              
              <TextField
                label="תאריך"
                type="date"
                fullWidth
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                disabled={isExtracting}
              />

              <TextField
                select
                label="שיטת תשלום"
                fullWidth
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                disabled={isExtracting}
              >
                <MenuItem value="CASH">מזומן</MenuItem>
                <MenuItem value="CHEQUE">צ'ק</MenuItem>
                <MenuItem value="MONEY_TRANSFER">העברה בנקאית</MenuItem>
              </TextField>

              {formData.method === 'CHEQUE' && (
                <>
                  <TextField label="בנק" fullWidth value={formData.bank || ''} onChange={(e) => setFormData({ ...formData, bank: e.target.value })} disabled={isExtracting} />
                  <TextField label="סניף" fullWidth value={formData.branch || ''} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} disabled={isExtracting} />
                  <TextField label="חשבון" fullWidth value={formData.account || ''} onChange={(e) => setFormData({ ...formData, account: e.target.value })} disabled={isExtracting} />
                  <TextField label="מס' צ'ק" fullWidth value={formData.chequeNumber || ''} onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })} disabled={isExtracting} />
                  <TextField
                    label="תאריך פירעון"
                    type="date"
                    fullWidth
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    disabled={isExtracting}
                  />
                </>
              )}

              {formData.method === 'MONEY_TRANSFER' && (
                <TextField label="מספר אסמכתא" fullWidth value={formData.referenceNumber || ''} onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })} disabled={isExtracting} />
              )}

              <TextField
                label="הערות"
                fullWidth
                multiline
                rows={3}
                value={formData.remarks || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length <= 255) {
                    setFormData({ ...formData, remarks: val });
                  }
                }}
                helperText={`${255 - (formData.remarks?.length || 0)} (/ 255)`}
                disabled={isExtracting}
              />
            </Box>
          </Grid>

          {/* Left Column: Drag and Drop Area */}
          {!isEditing && (
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                onDragOver={(e) => e.preventDefault()}
                onDrop={handlePaymentFileDrop}
                sx={{
                  border: '2px dashed',
                  borderColor: isExtracting ? 'primary.main' : '#ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: isExtracting ? 'default' : 'pointer',
                  bgcolor: isExtracting ? '#f0f8ff' : '#fafafa',
                  height: '100%',
                  minHeight: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: isExtracting ? 'primary.main' : 'primary.light',
                    bgcolor: isExtracting ? '#f0f8ff' : '#f5faff',
                  }
                }}
                onClick={() => {
                  if (!isExtracting) document.getElementById('paymentFileInput')?.click();
                }}
              >
                <input
                  type="file"
                  id="paymentFileInput"
                  hidden
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handlePaymentFileChange}
                  disabled={isExtracting}
                />
                {isExtracting ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={56} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="primary">מפענח נתונים...</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>אנא המתן בזמן שאנו סורקים את המסמך</Typography>
                  </Box>
                ) : paymentFilePreview ? (
                  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {paymentFilePreview === 'PDF' ? (
                      <Box sx={{ textAlign: 'center' }}>
                        <DocIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                        <Typography variant="h6">מסמך PDF הועלה</Typography>
                      </Box>
                    ) : (
                      <img src={paymentFilePreview} alt="Preview" style={{ maxHeight: 300, maxWidth: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                    )}
                    <Typography variant="body2" color="primary" sx={{ mt: 3, fontWeight: 'bold' }}>לחץ או גרור מסמך אחר להחלפה</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CloudUploadIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
                    <Typography variant="h6" gutterBottom>העלאת אסמכתא</Typography>
                    <Typography variant="body2" color="text.secondary">גרור ושחרר קובץ לכאן</Typography>
                    <Typography variant="body2" color="text.secondary">או לחץ לבחירת קובץ</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block', px: 2 }}>
                      תומך בתמונות (JPG, PNG, WEBP) ובמסמכי PDF
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={isExtracting} size="large">
          ביטול
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isExtracting} size="large" sx={{ px: 4 }}>
          שמור תשלום
        </Button>
      </DialogActions>
    </Dialog>
  );
}