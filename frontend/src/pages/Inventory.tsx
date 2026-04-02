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
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  History as HistoryIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { inventoryService } from '../services/inventoryService';
import type { Item, SupplierOption } from '../services/inventoryService';
import ConfirmDialog from '../components/common/ConfirmDialog';
import InventoryUploadDialog from '../components/common/InventoryUploadDialog';
import type { InventoryHistory } from '../types';

export default function Inventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('');

  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);

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
  }, [page, rowsPerPage]);

  const loadData = async () => {
    try {
      const response = await inventoryService.getAll(page, rowsPerPage);
      setItems(response.data.page.content);
      setTotalElements(response.data.page.totalElements);
      setSuppliers(response.data.suppliers);
    } catch (error) {
      console.error('Error loading items', error);
    }
  };

  const filteredItems = useMemo(() => {
    if (!filter.trim()) return items;
    const parts = filter.trim().split(/\s+/).map(p => p.toLowerCase());
    return items.filter((item) =>
      parts.every(part =>
        item.name.toLowerCase().includes(part) ||
        item.supplierName?.toLowerCase().includes(part) ||
        item.sku?.toLowerCase().includes(part)
      )
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
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

  return (
    <Box
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{ minHeight: '100vh', width: '100%' }}
    >
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
                <TableCell>{formatPrice(item.priceExcludingVAT)}</TableCell>
                <TableCell>
                  <Link
                    component="button"
                    underline="hover"
                    onClick={() => navigate('/suppliers', { state: { openSupplierId: item.supplierId } })}
                  >
                    {item.supplierName}
                  </Link>
                </TableCell>
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
                    <TableCell>{formatPrice(h.snapshot.priceExcludingVAT)}</TableCell>
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
