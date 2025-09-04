import React from 'react';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

const StyledButton = styled(MuiButton)(({ theme, variant, size, fullWidth }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  ...(size === 'small' && {
    padding: theme.spacing(0.5, 2),
    fontSize: '0.875rem',
  }),
  ...(size === 'large' && {
    padding: theme.spacing(1.25, 4),
    fontSize: '1rem',
  }),
  ...(variant === 'contained' && {
    boxShadow: 'none',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(45, 140, 255, 0.2)',
    },
  }),
  ...(fullWidth && {
    width: '100%',
  }),
}));

const Button = ({
  children,
  loading = false,
  startIcon,
  endIcon,
  disabled = false,
  onClick,
  type = 'button',
  color = 'primary',
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  sx = {},
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      color={color}
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      fullWidth={fullWidth}
      startIcon={
        loading ? (
          <CircularProgress size={size === 'small' ? 16 : 20} color="inherit" />
        ) : (
          startIcon
        )
      }
      endIcon={!loading ? endIcon : null}
      sx={{
        '&.Mui-disabled': {
          backgroundColor: (theme) =>
            variant === 'contained' ? theme.palette.action.disabledBackground : 'transparent',
          color: (theme) => theme.palette.action.disabled,
        },
        ...sx,
      }}
      {...props}
    >
      {!loading && children}
      {loading && !startIcon && !endIcon && (
        <span style={{ visibility: 'hidden' }}>{children}</span>
      )}
    </StyledButton>
  );
};

export default Button;
