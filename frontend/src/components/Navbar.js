import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  Box,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  AccountCircle,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
}));

const Navbar = ({ isDarkMode, onThemeToggle }) => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const handleThemeToggle = () => {
    onThemeToggle();
  };

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuAnchor(null);
  }, [location.pathname]);

  const renderDesktopMenu = () => (
    <>
      <Button
        color="inherit"
        component={RouterLink}
        to="/dashboard"
        sx={{ mr: 2, display: { xs: 'none', md: 'inline-flex' } }}
      >
        Dashboard
      </Button>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
        <IconButton color="inherit" onClick={handleThemeToggle} sx={{ mr: 1 }}>
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>
      
      {isAuthenticated ? (
        <>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              aria-controls={anchorEl ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={anchorEl ? 'true' : undefined}
            >
              {currentUser?.avatar_url ? (
                <Avatar 
                  src={currentUser.avatar_url} 
                  alt={currentUser.display_name || 'User'}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {currentUser?.display_name?.[0] || 'U'}
                </Avatar>
              )}
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {currentUser?.display_name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentUser?.email || ''}
              </Typography>
            </Box>
            <Divider />
            <MenuItem component={RouterLink} to="/dashboard">
              <ListItemIcon>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              Dashboard
            </MenuItem>
            <MenuItem component={RouterLink} to="/settings">
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Button
          color="primary"
          variant="contained"
          component={RouterLink}
          to="/login"
          sx={{ ml: 2 }}
        >
          Sign In
        </Button>
      )}
    </>
  );

  const renderMobileMenu = () => (
    <>
      <Box sx={{ flexGrow: 1 }} />
      
      <IconButton
        size="large"
        aria-label="show more"
        aria-haspopup="true"
        onClick={handleMobileMenuOpen}
        color="inherit"
      >
        <MenuIcon />
      </IconButton>
      
      <Menu
        anchorEl={mobileMenuAnchor}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMenuClose}
      >
        {isAuthenticated ? (
          [
            <MenuItem key="profile" onClick={handleMenuOpen}>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </MenuItem>,
            <MenuItem key="dashboard" component={RouterLink} to="/dashboard">
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </MenuItem>,
            <MenuItem key="theme" onClick={handleThemeToggle}>
              <ListItemIcon>
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </ListItemIcon>
              <ListItemText primary={isDarkMode ? 'Light Mode' : 'Dark Mode'} />
            </MenuItem>,
            <Divider key="divider" />,
            <MenuItem key="logout" onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>,
          ]
        ) : (
          <MenuItem component={RouterLink} to="/login">
            <ListItemIcon>
              <AccountCircle />
            </ListItemIcon>
            <ListItemText primary="Sign In" />
          </MenuItem>
        )}
      </Menu>
    </>
  );

  return (
    <StyledAppBar position="fixed">
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component={RouterLink}
          to="/"
          sx={{
            mr: 2,
            display: 'flex',
            fontWeight: 700,
            color: 'inherit',
            textDecoration: 'none',
            alignItems: 'center',
          }}
        >
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              mr: 1,
            }}
          >
            Z
          </Box>
          oom Notes
        </Typography>
        
        {isMobile ? renderMobileMenu() : renderDesktopMenu()}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;
