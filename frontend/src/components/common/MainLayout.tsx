import { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as CustomersIcon,
  Business as SuppliersIcon,
  Logout as LogoutIcon,
  Category as CategoryIcon,
  Receipt as ExpenseIcon,
  CloudUpload as UploadIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import NotificationCenter from '../ui/NotificationCenter';

const drawerWidth = 240;

interface Props {
  children: React.ReactNode;
}

export default function MainLayout({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { roles } = useSelector((state: RootState) => state.auth);
  const isAdmin = roles.includes('ADMIN');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'דאשבורד', icon: <DashboardIcon />, path: '/' },
    { text: 'מלאי', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'קטגוריות', icon: <CategoryIcon />, path: '/categories' },
    { text: 'לקוחות', icon: <CustomersIcon />, path: '/customers' },
    { text: 'ספקים', icon: <SuppliersIcon />, path: '/suppliers' },
    { text: 'הוצאות', icon: <ExpenseIcon />, path: '/expenses' },
    { text: 'מסמכים', icon: <UploadIcon />, path: '/documents' },
    { text: 'דוחות', icon: <AssessmentIcon />, path: '/reports' },
  ];

  if (isAdmin) {
    menuItems.push({ text: 'ניהול משתמשים', icon: <CustomersIcon />, path: '/users' });
  }

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          מנהל הנגריה
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="התנתקות" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find((m) => m.path === location.pathname)?.text || 'ניהול נגרייה'}
          </Typography>
          <NotificationCenter />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          anchor="left"
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
          anchor="left"
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar />
        <Box sx={{ width: '100%' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
