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
  Box,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { documentService } from '../services/documentService';
import type { CarpentryDocument } from '../services/documentService';

export default function Documents() {
  const [documents, setDocuments] = useState<CarpentryDocument[]>([]);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState('INVOICE');
  
  const [viewDoc, setViewDoc] = useState<CarpentryDocument | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await documentService.getAll();
      setDocuments(response.data);
    } catch (error) {
      console.error('Error loading documents', error);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      await documentService.upload(file, type);
      loadDocuments();
      setOpen(false);
      setFile(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'שגיאה בהעלאה');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PROCESSED': return <SuccessIcon color="success" />;
      case 'FAILED': return <ErrorIcon color="error" />;
      default: return <PendingIcon color="warning" />;
    }
  };

  const typeLabels: Record<string, string> = {
    INVOICE: 'חשבונית',
    RECEIPT: 'קבלה',
    DELIVERY_NOTE: 'תעודת משלוח',
    PAYMENT_CHECK: 'צ\'ק',
    BANK_TRANSFER: 'העברה בנקאית',
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ניהול מסמכים
      </Typography>
      <Button
        variant="contained"
        startIcon={<UploadIcon />}
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        העלה מסמך
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם הקובץ</TableCell>
              <TableCell>סוג</TableCell>
              <TableCell>תאריך העלאה</TableCell>
              <TableCell>גודל</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.originalName}</TableCell>
                <TableCell>{typeLabels[doc.type]}</TableCell>
                <TableCell>{new Date(doc.uploadDate).toLocaleString()}</TableCell>
                <TableCell>{(doc.fileSize / 1024).toFixed(2)} KB</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(doc.status)}
                    {doc.status}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => setViewDoc(doc)} disabled={doc.status !== 'PROCESSED'}>
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>העלאת מסמך חדש</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="סוג המסמך"
              fullWidth
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {Object.entries(typeLabels).map(([key, label]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </TextField>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>ביטול</Button>
          <Button onClick={handleUpload} variant="contained" disabled={!file}>
            העלה וקלוט
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!viewDoc} onClose={() => setViewDoc(null)} maxWidth="md" fullWidth>
        <DialogTitle>נתונים שחולצו מהמסמך: {viewDoc?.originalName}</DialogTitle>
        <DialogContent>
          <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#f9f9f9' }}>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {viewDoc?.extractedData ? JSON.stringify(JSON.parse(viewDoc.extractedData), null, 2) : 'אין נתונים'}
            </pre>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDoc(null)}>סגור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
