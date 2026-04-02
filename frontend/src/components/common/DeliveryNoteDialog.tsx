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
import type { DeliveryNote } from '../../services/supplierService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (dn: DeliveryNote) => void;
  initialData: DeliveryNote | null;
}

export default function DeliveryNoteDialog({ open, onClose, onSave, initialData }: Props) {
  const [formData, setFormData] = useState<Partial<DeliveryNote>>({});

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
    if (formData.deliveryNoteId && formData.deliveryNoteDate) {
      onSave(formData as DeliveryNote);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'עריכת תעודת משלוח' : 'הוספת תעודת משלוח'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="deliveryNoteId"
              label="מספר תעודת משלוח"
              fullWidth
              required
              value={formData.deliveryNoteId || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="deliveryNoteDate"
              label="תאריך תעודה"
              type="date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={formData.deliveryNoteDate || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="totalAmount"
              label='סכום משוער'
              type="number"
              fullWidth
              value={formData.totalAmount || 0}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button onClick={handleSave} variant="contained" disabled={!formData.deliveryNoteId || !formData.deliveryNoteDate}>
          שמור
        </Button>
      </DialogActions>
    </Dialog>
  );
}
