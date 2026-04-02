import { useState, useEffect, useMemo } from 'react';
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
  MenuItem,
  TablePagination,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  History as HistoryIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { inventoryService } from '../services/inventoryService';
import type { Item } from '../services/inventoryService';
import { supplierService } from '../services/supplierService';
import type { Supplier } from '../services/supplierService';
import ConfirmDialog from '../components/common/ConfirmDialog';
import InventoryUploadDialog from '../components/common/InventoryUploadDialog';
import type { InventoryHistory } from '../types';

export default function Inventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('');

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [open, setOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<Partial<Item>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [itemHistory, setItemHistory] = useState<InventoryHistory[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
    loadLookups();
  }, [page, rowsPerPage]);

  const loadData = async () => {
    try {
      const response = await inventoryService.getAll(page, rowsPerPage);
      setItems(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Error loading items', error);
    }
  };

  const loadLookups = async () => {
    const res = await supplierService.getAll();
    setSuppliers(res.data);
  };

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(filter.toLowerCase()) ||
      item.supplierName?.toLowerCase().includes(filter.toLowerCase()) ||
      item.sku?.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'שם הפריט הוא חובה';
    if (formData.name && formData.name.length > 150) newErrors.name = 'שם הפריט חייב להיות עד 150 תווים';
    if (formData.quantity === undefined || formData.quantity < 0) newErrors.quantity = 'כמות חייבת להיות 0 ומעלה';
    if (formData.priceExcludingVAT === undefined || formData.priceExcludingVAT < 0) newErrors.priceExcludingVAT = 'מחיר חייב להיות 0 ומעלה';
    if (!formData.supplierId) newErrors.supplierId = 'ספק הוא חובה';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpen = (item?: Item) => {
    setErrors({});
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        quantity: 0,
        priceExcludingVAT: 0,
        supplierId: '',
        sku: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (editingItem) {
        await inventoryService.update(editingItem.id, formData);
      } else {
        await inventoryService.create(formData);
      }
      loadData();
      handleClose();
    } catch (error) {
      console.error('Error saving item', error);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await inventoryService.delete(deleteId);
        loadData();
        setDeleteId(null);
      } catch (error) {
        console.error('Error deleting item', error);
      }
    }
  };

  const handleShowHistory = async (id: string) => {
    try {
      const response = await inventoryService.getHistory(id);
      setItemHistory(response.data);
      setHistoryOpen(true);
    } catch (error) {
      console.error('Error loading history', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'quantity' || name === 'priceExcludingVAT' ? Number(value) : value });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ניהול מלאי
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            הוסף פריט
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploadDialogOpen(true)}
          >
            העלה מסמך
          </Button>
          <TextField
            size="small"
            placeholder="חיפוש..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </Box>
        <Typography variant="body2">
          {filteredItems.length} מתוך {totalElements}
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם הפריט</TableCell>
              <TableCell>כמות</TableCell>
              <TableCell>מחיר (ללא מע"מ)</TableCell>
              <TableCell>ספק</TableCell>
              <TableCell>מק"ט</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>₪{item.priceExcludingVAT.toFixed(2)}</TableCell>
                <TableCell>{item.supplierName}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell align="right">
                  <Tooltip title="היסטוריית שינויים">
                    <IconButton onClick={() => handleShowHistory(item.id)}>
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={() => handleOpen(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => setDeleteId(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">אין פריטים במלאי</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="שורות בעמוד:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} מתוך ${count}`}
        />
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'עריכת פריט' : 'הוספת פריט'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="name"
                label="שם הפריט"
                fullWidth
                required
                value={formData.name || ''}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="quantity"
                label="כמות"
                type="number"
                fullWidth
                required
                value={formData.quantity || 0}
                onChange={handleChange}
                error={!!errors.quantity}
                helperText={errors.quantity}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="priceExcludingVAT"
                label='מחיר ללא מע"מ'
                type="number"
                fullWidth
                required
                value={formData.priceExcludingVAT || 0}
                onChange={handleChange}
                error={!!errors.priceExcludingVAT}
                helperText={errors.priceExcludingVAT}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                name="supplierId"
                label="ספק"
                fullWidth
                required
                value={formData.supplierId || ''}
                onChange={handleChange}
                error={!!errors.supplierId}
                helperText={errors.supplierId}
              >
                {suppliers.map((sup) => (
                  <MenuItem key={sup.id} value={sup.id}>
                    {sup.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="sku"
                label='מק"ט'
                fullWidth
                value={formData.sku || ''}
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

      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>היסטוריית שינויים - {itemHistory[0]?.snapshot?.name}</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>תאריך שינוי</TableCell>
                  <TableCell>משתמש</TableCell>
                  <TableCell>כמות</TableCell>
                  <TableCell>מחיר</TableCell>
                  <TableCell>גירסה</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itemHistory.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{new Date(h.changeDate).toLocaleString()}</TableCell>
                    <TableCell>{h.changedBy}</TableCell>
                    <TableCell>{h.snapshot.quantity}</TableCell>
                    <TableCell>₪{h.snapshot.priceExcludingVAT}</TableCell>
                    <TableCell>{h.snapshot.version}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)}>סגור</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="מחיקת פריט"
        content="האם אתה בטוח שברצונך למחוק פריט זה?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <InventoryUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSuccess={() => {
          setUploadDialogOpen(false);
          loadData();
        }}
      />
    </Box>
  );
}
