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
  Grid,
  Box,
  MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { expenseService } from '../services/expenseService';
import type { Expense } from '../services/expenseService';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatPrice } from '../utils/formatPrice';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<Partial<Expense>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadExpenses();
  }, [year, month]);

  const loadExpenses = async () => {
    try {
      const response = await expenseService.getByMonth(year, month);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error loading expenses', error);
    }
  };

  const handleOpen = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData(expense);
    } else {
      setEditingExpense(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        amountExcludingVAT: 0,
        amountIncludingVAT: 0,
      });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    try {
      if (editingExpense) {
        await expenseService.update(editingExpense.id, formData);
      } else {
        await expenseService.create(formData);
      }
      loadExpenses();
      handleClose();
    } catch (error) {
      console.error('Error saving expense', error);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await expenseService.delete(deleteId);
        loadExpenses();
        setDeleteId(null);
      } catch (error) {
        console.error('Error deleting expense', error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amountExcludingVAT' || name === 'amountIncludingVAT' ? Number(value) : value
    });
  };

  const totalExcl = expenses.reduce((sum, e) => sum + e.amountExcludingVAT, 0);
  const totalIncl = expenses.reduce((sum, e) => sum + e.amountIncludingVAT, 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ניהול הוצאות
      </Typography>

      <Box sx={{ display: 'flex', mb: 2, gap: 2, alignItems: 'center' }}>
        <TextField
          select
          label="שנה"
          size="small"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[2024, 2025, 2026].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </TextField>
        <TextField
          select
          label="חודש"
          size="small"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <MenuItem key={m} value={m}>{m}</MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          הוסף הוצאה
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>תאריך</TableCell>
              <TableCell>קטגוריה</TableCell>
              <TableCell>סכום (ללא מע"מ)</TableCell>
              <TableCell>סכום (כולל מע"מ)</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.date}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{formatPrice(expense.amountExcludingVAT)}</TableCell>
                <TableCell>{formatPrice(expense.amountIncludingVAT)}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(expense)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => setDeleteId(expense.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell colSpan={2}><strong>סה"כ</strong></TableCell>
              <TableCell><strong>{formatPrice(totalExcl)}</strong></TableCell>
              <TableCell><strong>{formatPrice(totalIncl)}</strong></TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingExpense ? 'עריכת הוצאה' : 'הוספת הוצאה'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="date"
                label="תאריך"
                type="date"
                fullWidth
                required
                value={formData.date || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="category"
                label="קטגוריה (חשמל, טלפון, דלק...)"
                fullWidth
                required
                value={formData.category || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="amountExcludingVAT"
                label='סכום ללא מע"מ'
                type="number"
                fullWidth
                required
                value={formData.amountExcludingVAT || 0}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="amountIncludingVAT"
                label='סכום כולל מע"מ'
                type="number"
                fullWidth
                required
                value={formData.amountIncludingVAT || 0}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
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
        title="מחיקת הוצאה"
        content="האם אתה בטוח שברצונך למחוק הוצאה זו?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
