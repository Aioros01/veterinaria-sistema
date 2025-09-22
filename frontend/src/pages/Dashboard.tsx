import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Pets,
  CalendarMonth,
  LocalHospital,
  Inventory,
} from '@mui/icons-material';
import Grid from '../components/GridCompat';
import { dashboardService } from '../services/api';

interface DashboardStats {
  totalPets: number;
  todayAppointments: number;
  upcomingAppointments: number;
  lowStockMedicines: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  // Obtener el rol correctamente desde el objeto user
  const userStr = localStorage.getItem('user');
  const userObj = userStr ? JSON.parse(userStr) : null;
  const userRole = userObj?.role;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await dashboardService.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Filtrar las tarjetas según el rol del usuario
  const getStatCards = () => {
    const baseCards = [
      {
        title: userRole === 'cliente' ? 'Mis Mascotas' : 'Total Mascotas',
        value: stats?.totalPets || 0,
        icon: <Pets fontSize="large" />,
        color: '#4caf50',
      },
      {
        title: userRole === 'cliente' ? 'Mis Citas Hoy' : 'Citas Hoy',
        value: stats?.todayAppointments || 0,
        icon: <CalendarMonth fontSize="large" />,
        color: '#2196f3',
      },
      {
        title: userRole === 'cliente' ? 'Mis Próximas Citas' : 'Citas Próximas',
        value: stats?.upcomingAppointments || 0,
        icon: <LocalHospital fontSize="large" />,
        color: '#ff9800',
      },
    ];

    // Solo mostrar medicamentos bajo stock para admin y veterinarios
    if (userRole !== 'cliente') {
      baseCards.push({
        title: 'Medicamentos Bajo Stock',
        value: stats?.lowStockMedicines || 0,
        icon: <Inventory fontSize="large" />,
        color: '#f44336',
      });
    }

    return baseCards;
  };

  const statCards = getStatCards();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Actividad Reciente
            </Typography>
            <Typography color="textSecondary">
              Las actividades recientes aparecerán aquí
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recordatorios
            </Typography>
            <Typography color="textSecondary">
              Los recordatorios pendientes aparecerán aquí
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;