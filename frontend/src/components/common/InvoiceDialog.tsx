import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid
} from '@mui/material';
import type { Invoice } from '../../services/supplierService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
  initialData: Invoice | null;
}

export default function InvoiceDialog({ open, onClose, onSave, initialData }: Props) {
  const [formData, setFormData] = useState<Partial<Invoice>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalAmount' ? Number(value) : value,
    }));
  };

  const handleSave = () => {
    if (formData.invoiceId && formData.totalAmount !== undefined && formData.invoiceDate) {
      onSave(formData as Invoice);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>עריכת חשבונית</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="invoiceId"
              label="מספר חשבונית"
              fullWidth
              required
              value={formData.invoiceId || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="invoiceDate"
              label="תאריך חשבונית"
              type="date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={formData.invoiceDate || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="totalAmount"
              label='סכום (כולל מע"מ)'
              type="number"
              fullWidth
              required
              value={formData.totalAmount || 0}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button onClick={handleSave} variant="contained" disabled={!formData.invoiceId || formData.totalAmount === undefined || !formData.invoiceDate}>
          שמור
        </Button>
      </DialogActions>
    </Dialog>
  );
}
