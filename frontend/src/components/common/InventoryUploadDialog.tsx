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
  Grid
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { documentService } from '../../services/documentService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InventoryUploadDialog({ open, onClose, onSuccess }: Props) {
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
      setExtractedData(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'שגיאה בניתוח המסמך. ודא שהקובץ תקין.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApprove = async () => {
    if (!extractedData || !extractedData.documentId) return;
    
    setSaving(true);
    setError(null);
    try {
      await documentService.approveInventoryDocument(extractedData.documentId, extractedData);
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
              p: 6,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: 'background.default',
              '&:hover': { bgcolor: 'action.hover' }
            }}
            component="label"
          >
            <input
              type="file"
              hidden
              accept="image/*,application/pdf"
              onChange={handleFileInput}
            />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              גרור ושחרר קובץ לכאן, או לחץ כדי לבחור (PDF / תמונות)
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
                    <TableCell>תיאור פריט</TableCell>
                    <TableCell>כמות</TableCell>
                    <TableCell>מחיר ליחידה (ללא מע"מ)</TableCell>
                    <TableCell>סה"כ (ללא מע"מ)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {extractedData.items?.map((item: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₪{item.pricePerUnitWithoutVat}</TableCell>
                      <TableCell>₪{item.totalPriceWithoutVat}</TableCell>
                    </TableRow>
                  ))}
                  {(!extractedData.items || extractedData.items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">לא זוהו פריטים</TableCell>
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
