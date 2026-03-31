import { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { customerService } from '../services/customerService';
import type { Customer } from '../services/customerService';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CustomerDetails from './CustomerDetails';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerService.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers', error);
    }
  };

  const handleOpen = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData(customer);
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', email: '', address: '', discount: 0 });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer.id, formData);
      } else {
        await customerService.create(formData);
      }
      loadCustomers();
      handleClose();
    } catch (error) {
      console.error('Error saving customer', error);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await customerService.delete(deleteId);
        loadCustomers();
        setDeleteId(null);
      } catch (error) {
        console.error('Error deleting customer', error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.name === 'discount' ? Number(e.target.value) : e.target.value });
  };

  if (selectedCustomerId) {
    return <CustomerDetails id={selectedCustomerId} onBack={() => {
      setSelectedCustomerId(null);
      loadCustomers();
    }} />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ניהול לקוחות
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        הוסף לקוח
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם הלקוח</TableCell>
              <TableCell>טלפון</TableCell>
              <TableCell>יתרת חוב</TableCell>
              <TableCell>סטטוס תיק</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell sx={{ color: customer.debt > 0 ? 'error.main' : 'inherit' }}>
                  ₪{customer.debt.toFixed(2)}
                </TableCell>
                <TableCell>{customer.closed ? 'סגור' : 'פתוח'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => setSelectedCustomerId(customer.id)}>
                    <ViewIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpen(customer)} disabled={customer.closed}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => setDeleteId(customer.id)} disabled={customer.closed}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingCustomer ? 'עריכת לקוח' : 'הוספת לקוח'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              name="name"
              label="שם הלקוח"
              fullWidth
              required
              margin="normal"
              value={formData.name || ''}
              onChange={handleChange}
            />
            <TextField
              name="phone"
              label="טלפון"
              fullWidth
              required
              margin="normal"
              value={formData.phone || ''}
              onChange={handleChange}
            />
            <TextField
              name="email"
              label="אימייל"
              fullWidth
              margin="normal"
              value={formData.email || ''}
              onChange={handleChange}
            />
            <TextField
              name="address"
              label="כתובת"
              fullWidth
              margin="normal"
              value={formData.address || ''}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>ביטול</Button>
          <Button onClick={handleSave} variant="contained">
            שמור
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="מחיקת לקוח"
        content="האם אתה בטוח שברצונך למחוק לקוח זה?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
