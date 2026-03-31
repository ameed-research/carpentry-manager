import { useEffect, useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { addNotification } from '../../store/notificationSlice';

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    const socket = new SockJS('/ws');
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {}; // Disable debug logging

    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/notifications', (message) => {
        const notification = JSON.parse(message.body);
        dispatch(addNotification(notification));
      });
    });

    return () => {
      if (stompClient.connected) {
        stompClient.disconnect(() => {});
      }
    };
  }, [dispatch]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'WARNING': return <WarningIcon color="warning" />;
      case 'ERROR': return <ErrorIcon color="error" />;
      default: return <InfoIcon color="primary" />;
    }
  };

  return (
    <Box>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: { width: 320, maxHeight: 400 },
        }}
      >
        <Typography sx={{ p: 2, fontWeight: 'bold' }}>התראות</Typography>
        <Divider />
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <MenuItem sx={{ py: 2 }}>
              <ListItemText primary="אין התראות חדשות" />
            </MenuItem>
          ) : (
            notifications.map((n) => (
              <ListItem key={n.id} sx={{ borderBottom: '1px solid #eee' }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getIcon(n.type)}
                </ListItemIcon>
                <ListItemText
                  primary={n.message}
                  secondary={new Date(n.timestamp).toLocaleString()}
                />
              </ListItem>
            ))
          )}
        </List>
      </Menu>
    </Box>
  );
}
