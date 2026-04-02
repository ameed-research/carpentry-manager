import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Checkbox,
  TextField,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { documentService } from '../../services/documentService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expectedSupplier?: { name?: string; taxId?: string };
}

export default function InventoryUploadDialog({ open, onClose, onSuccess, expectedSupplier }: Props) {
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    setAnalyzing(true);
    setExtractedData(null);

    try {
      const response = await documentService.analyzeInventoryDocument(selectedFile);
      const data = response.data;
      
      // Initialize selection and items
      if (data.items && Array.isArray(data.items)) {
        data.items = data.items.map((item: any) => ({
          ...item,
          selected: item.description ? !item.description.includes('משלוח') : true
        }));
      }

      setExtractedData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'שגיאה בניתוח המסמך. ודא שהקובץ תקין.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApprove = async () => {
    if (!extractedData || !extractedData.dbDocumentId) return;

    if (expectedSupplier) {
      const nameMismatch = expectedSupplier.name && extractedData.supplierName && 
                          !extractedData.supplierName.includes(expectedSupplier.name) &&
                          !expectedSupplier.name.includes(extractedData.supplierName);
      const taxIdMismatch = expectedSupplier.taxId && extractedData.supplierTaxId && 
                           extractedData.supplierTaxId !== expectedSupplier.taxId;

      if (nameMismatch || taxIdMismatch) {
        const confirm = window.confirm('אזהרה: מסמך זה עשוי להיות שייך לספק אחר. האם להמשיך?');
        if (!confirm) return;
      }
    }
    
    setSaving(true);
    setError(null);
    try {
      // Filter out unselected items
      const finalData = {
        ...extractedData,
        items: extractedData.items?.filter((item: any) => item.selected) || []
      };

      await documentService.approveInventoryDocument(finalData.dbDocumentId, finalData);
      onSuccess();
      handleReset();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'שגיאה בשמירת הנתונים');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setExtractedData(null);
    setError(null);
    setAnalyzing(false);
    setSaving(false);
    onClose();
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    if (!extractedData) return;
    const newItems = [...extractedData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setExtractedData({ ...extractedData, items: newItems });
  };

  return (
    <Dialog open={open} onClose={handleReset} maxWidth="md" fullWidth>
      <DialogTitle>העלאת מסמך ספק</DialogTitle>
      <DialogContent>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {!extractedData && !analyzing && (
          <Box
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 10,
              my: 2,
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              bgcolor: 'background.default',
              '&:hover': { bgcolor: 'action.hover' }
            }}
            component="label"
          >
            <input
              id="inventory-upload-input"
              type="file"
              hidden
              accept="image/*,application/pdf"
              onChange={handleFileInput}
            />
            <CloudUploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary">
              גרור ושחרר קובץ לכאן
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              או לחץ כדי לבחור (PDF / תמונות)
            </Typography>
          </Box>
        )}

        {analyzing && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography>מנתח את המסמך בעזרת AI...</Typography>
          </Box>
        )}

        {extractedData && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              סיכום נתונים שחולצו ({extractedData.type === 'INVOICE' ? 'חשבונית' : 'תעודת משלוח'})
            </Typography>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="subtitle2" color="textSecondary">שם ספק</Typography>
                  <Typography>{extractedData.supplierName || 'לא זוהה'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="subtitle2" color="textSecondary">ח.פ. / עוסק מורשה</Typography>
                  <Typography>{extractedData.supplierTaxId || 'לא זוהה'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="subtitle2" color="textSecondary">מספר מסמך</Typography>
                  <Typography>{extractedData.documentId || 'לא זוהה'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="subtitle2" color="textSecondary">תאריך</Typography>
                  <Typography>{extractedData.date || 'לא זוהה'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="subtitle2" color="textSecondary">סך הכל לפני מע"מ</Typography>
                  <Typography>₪{extractedData.totalAmountWithoutVat || 'לא צוין'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="subtitle2" color="textSecondary">סך הכל כולל מע"מ</Typography>
                  <Typography>₪{extractedData.totalAmountWithVat || 'לא צוין'}</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="h6" gutterBottom>פריטי מלאי שזוהו</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"></TableCell>
                    <TableCell>תיאור פריט</TableCell>
                    <TableCell>כמות</TableCell>
                    <TableCell>מחיר ליחידה (ללא מע"מ)</TableCell>
                    <TableCell>סה"כ (ללא מע"מ)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {extractedData.items?.map((item: any, idx: number) => (
                    <TableRow key={idx} selected={item.selected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={!!item.selected}
                          onChange={(e) => handleItemChange(idx, 'selected', e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={item.description || ''}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={item.pricePerUnitWithoutVat || ''}
                          onChange={(e) => handleItemChange(idx, 'pricePerUnitWithoutVat', Number(e.target.value))}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={item.totalPriceWithoutVat || ''}
                          onChange={(e) => handleItemChange(idx, 'totalPriceWithoutVat', Number(e.target.value))}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!extractedData.items || extractedData.items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">לא זוהו פריטים</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} disabled={saving || analyzing}>ביטול</Button>
        {extractedData && (
          <Button onClick={handleApprove} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'אישור ושמירה'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
