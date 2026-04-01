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
        onClick={() => setSelectedCustomerId('new')}
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
                  <IconButton onClick={() => setSelectedCustomerId(customer.id)} disabled={customer.closed}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => setDeleteId(customer.id)} disabled={customer.closed}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">אין לקוחות רשומים</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
