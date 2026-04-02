import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { supplierService } from '../services/supplierService';
import type { SupplierSummary } from '../services/supplierService';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SupplierDetails from './SupplierDetails';
import { formatPrice } from '../utils/formatPrice';

export default function Suppliers() {
  const location = useLocation();
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const autoOpenHandled = useRef(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    const openSupplierId = location.state?.openSupplierId;
    if (openSupplierId && suppliers.length > 0 && !autoOpenHandled.current) {
      autoOpenHandled.current = true;
      setSelectedSupplierId(openSupplierId);
    }
  }, [suppliers, location.state]);

  const loadSuppliers = async () => {
    try {
      const response = await supplierService.getAll();
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error loading suppliers', error);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await supplierService.delete(deleteId);
        loadSuppliers();
        setDeleteId(null);
      } catch (error: any) {
        alert(error.response?.data?.message || 'שגיאה במחיקה');
      }
    }
  };

  if (selectedSupplierId) {
    return (
      <SupplierDetails
        id={selectedSupplierId}
        onBack={() => {
          setSelectedSupplierId(null);
          loadSuppliers();
        }}
      />
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom align="right">
        ניהול ספקים
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'start', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setSelectedSupplierId('new')}
        >
          הוסף ספק
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם הספק</TableCell>
              <TableCell>איש קשר</TableCell>
              <TableCell>טלפון</TableCell>
              <TableCell>יתרת ספק</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.contactPerson}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell sx={{ color: (supplier.balance || 0) < 0 ? 'error.main' : 'success.main' }}>
                  {formatPrice(supplier.balance || 0)}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => setSelectedSupplierId(supplier.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => setDeleteId(supplier.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">אין ספקים רשומים</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={!!deleteId}
        title="מחיקת ספק"
        content="האם אתה בטוח שברצונך למחוק ספק זה?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
