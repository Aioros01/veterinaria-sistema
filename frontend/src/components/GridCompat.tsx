// Componente de compatibilidad para Grid
import React from 'react';
import Box from '@mui/material/Box';

interface GridProps {
  container?: boolean;
  item?: boolean;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  spacing?: number;
  children?: React.ReactNode;
  sx?: any;
  [key: string]: any;
}

// Grid Container compatible
export const Grid: React.FC<GridProps> = ({ 
  container, 
  item, 
  xs, 
  sm, 
  md, 
  lg, 
  xl, 
  spacing, 
  children, 
  sx,
  ...rest 
}) => {
  if (container) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing ? spacing : 0,
          margin: spacing ? -spacing/2 : 0,
          ...sx
        }}
        {...rest}
      >
        {children}
      </Box>
    );
  }

  // Grid Item
  const getWidth = (size?: number) => {
    if (!size) return 'auto';
    return `${(size / 12) * 100}%`;
  };

  return (
    <Box
      sx={{
        flexBasis: getWidth(xs),
        flexGrow: 0,
        maxWidth: getWidth(xs),
        padding: spacing ? spacing/2 : 0,
        '@media (min-width: 600px)': sm ? {
          flexBasis: getWidth(sm),
          maxWidth: getWidth(sm),
        } : {},
        '@media (min-width: 900px)': md ? {
          flexBasis: getWidth(md),
          maxWidth: getWidth(md),
        } : {},
        '@media (min-width: 1200px)': lg ? {
          flexBasis: getWidth(lg),
          maxWidth: getWidth(lg),
        } : {},
        '@media (min-width: 1536px)': xl ? {
          flexBasis: getWidth(xl),
          maxWidth: getWidth(xl),
        } : {},
        ...sx
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default Grid;