import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
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
  MenuItem,
  Chip,
  Switch,
} from '@mui/material';
import { Delete as DeleteIcon, PersonAdd as AddIcon, Lock as LockIcon, LockOpen as UnlockIcon } from '@mui/icons-material';
import { userService, type User } from '../services/userService';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: '',
    password: '',
    roles: ['USER'],
    enabled: true,
    accountNonLocked: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users', error);
    }
  };

  const handleCreate = async () => {
    try {
      await userService.create(newUser as User);
      setOpen(false);
      loadUsers();
      setNewUser({ username: '', password: '', roles: ['USER'], enabled: true, accountNonLocked: true });
    } catch (error) {
      console.error('Error creating user', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) {
      try {
        await userService.delete(id);
        loadUsers();
      } catch (error) {
        console.error('Error deleting user', error);
      }
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await userService.updateStatus(user.id!, !user.enabled, user.accountNonLocked);
      loadUsers();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  const handleToggleLock = async (user: User) => {
    try {
      await userService.updateStatus(user.id!, user.enabled, !user.accountNonLocked);
      loadUsers();
    } catch (error) {
      console.error('Error updating lock status', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">ניהול משתמשים</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          משתמש חדש
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם משתמש</TableCell>
              <TableCell>תפקידים</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>נעול</TableCell>
              <TableCell align="left">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  {user.roles.map((role) => (
                    <Chip key={role} label={role} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={user.enabled}
                    onChange={() => handleToggleStatus(user)}
                    color="primary"
                  />
                  {user.enabled ? 'פעיל' : 'חסום'}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleToggleLock(user)}>
                    {user.accountNonLocked ? <UnlockIcon color="success" /> : <LockIcon color="error" />}
                  </IconButton>
                </TableCell>
                <TableCell align="left">
                  <IconButton onClick={() => handleDelete(user.id!)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>הוספת משתמש חדש</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
            <TextField
              label="שם משתמש"
              fullWidth
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
            <TextField
              label="סיסמה"
              type="password"
              fullWidth
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <TextField
              select
              label="תפקיד"
              fullWidth
              value={newUser.roles?.[0]}
              onChange={(e) => setNewUser({ ...newUser, roles: [e.target.value] })}
            >
              <MenuItem value="USER">משתמש (USER)</MenuItem>
              <MenuItem value="ADMIN">מנהל (ADMIN)</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>ביטול</Button>
          <Button onClick={handleCreate} variant="contained">שמור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
