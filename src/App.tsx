import { useCallback, useEffect, useState } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import {
  AppBar, Avatar, Box, Button, Chip, CircularProgress, Container, Drawer,
  FormControl, IconButton, MenuItem, Paper, Select, Snackbar, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { useApiMode } from './api/useApiMode'
import { doctorsApi } from './api/doctors.api'
import { patientsApi } from './api/patients.api'
import { appointmentsApi } from './api/appointments.api'
import type { Appointment } from './api/models'
import './App.css'

const drawerWidth = 256
const navigation = [
  { label: 'Dashboard', path: '/', icon: DashboardRoundedIcon },
  { label: 'Patients', path: '/patients', icon: GroupsRoundedIcon },
  { label: 'Doctors', path: '/doctors', icon: MedicalServicesRoundedIcon },
  { label: 'Appointments', path: '/appointments', icon: CalendarMonthRoundedIcon },
]

function pageTitle(path: string) {
  return navigation.find((item) => item.path === path)?.label ?? 'Dashboard'
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium', timeStyle: 'short',
  }).format(date)
}

function Dashboard() {
  const { client, mode } = useApiMode()
  const [refreshKey, setRefreshKey] = useState(0)
  const [dashboardResult, setDashboardResult] = useState<{
    client: typeof client
    refreshKey: number
    counts: { doctors: number; patients: number; appointments: number }
    recent: Appointment[]
    error?: string
  } | null>(null)
  const resultIsCurrent = dashboardResult?.client === client && dashboardResult.refreshKey === refreshKey
  const loading = !resultIsCurrent
  const counts = resultIsCurrent ? dashboardResult.counts : { doctors: 0, patients: 0, appointments: 0 }
  const recent = resultIsCurrent ? dashboardResult.recent : []
  const error = resultIsCurrent ? dashboardResult.error ?? '' : ''

  const loadDashboard = useCallback(async (signal: AbortSignal) => {
    try {
      const [doctorResult, patientResult, appointmentResult] = await Promise.all([
        doctorsApi(client).list({ query: { page: 1, limit: 10 }, signal }),
        patientsApi(client).list({ query: { page: 1, limit: 10 }, signal }),
        appointmentsApi(client).list({ query: { page: 1, limit: 10 }, signal }),
      ])
      if (signal.aborted) return null
      return {
        client,
        refreshKey,
        counts: {
          doctors: doctorResult.pagination.totalRecords,
          patients: patientResult.pagination.totalRecords,
          appointments: appointmentResult.pagination.totalRecords,
        },
        recent: [...appointmentResult.data].sort((a, b) =>
          new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime(),
        ).slice(0, 5),
      }
    } catch (loadError) {
      if (signal.aborted) return null
      return {
        client,
        refreshKey,
        counts: { doctors: 0, patients: 0, appointments: 0 },
        recent: [],
        error: loadError instanceof Error ? loadError.message : 'Unable to load dashboard data.',
      }
    }
  }, [client, refreshKey])

  useEffect(() => {
    const controller = new AbortController()
    void loadDashboard(controller.signal).then((result) => {
      if (result && !controller.signal.aborted) setDashboardResult(result)
    })
    return () => controller.abort()
  }, [loadDashboard, refreshKey])

  const cards = [
    { label: 'Total doctors', value: counts.doctors, icon: MedicalServicesRoundedIcon, accent: 'blue' },
    { label: 'Total patients', value: counts.patients, icon: PeopleAltRoundedIcon, accent: 'teal' },
    { label: 'Total appointments', value: counts.appointments, icon: EventAvailableRoundedIcon, accent: 'violet' },
  ]

  return <Stack spacing={3}>
    <Box className="welcome-row">
      <Box><Typography variant="h5" sx={{ fontWeight: 700 }}>Good day</Typography><Typography color="text.secondary">Here’s what’s happening at your clinic.</Typography></Box>
      <Button startIcon={<RefreshRoundedIcon />} onClick={() => setRefreshKey((key) => key + 1)} disabled={loading} variant="outlined">Refresh</Button>
    </Box>

    {error && <Paper className="error-banner" role="alert"><Box><Typography sx={{ fontWeight: 700 }}>Couldn’t load dashboard data</Typography><Typography variant="body2">{error}</Typography></Box><Button onClick={() => setRefreshKey((key) => key + 1)}>Try again</Button></Paper>}

    <Box className="metrics-grid">
      {cards.map((card) => {
        const Icon = card.icon
        return <Paper key={card.label} className="metric-card" elevation={0}>
          <Box className={`metric-icon ${card.accent}`}><Icon /></Box>
          <Box><Typography variant="body2" color="text.secondary">{card.label}</Typography>
            {loading ? <CircularProgress size={23} sx={{ mt: 0.6 }} /> : <Typography variant="h4" sx={{ fontWeight: 700 }} className="metric-value">{counts[card.accent === 'blue' ? 'doctors' : card.accent === 'teal' ? 'patients' : 'appointments'].toLocaleString()}</Typography>}
          </Box>
        </Paper>
      })}
    </Box>

    <Paper className="appointments-panel" elevation={0}>
      <Box className="panel-heading"><Box><Typography variant="h6" sx={{ fontWeight: 700 }}>Recent appointments</Typography><Typography variant="body2" color="text.secondary">Latest scheduled visits</Typography></Box><Chip label={mode === 'portfolio' ? 'Portfolio data' : 'Demo data'} size="small" className={mode === 'portfolio' ? 'mode-chip portfolio' : 'mode-chip demo'} /></Box>
      {loading ? <Box className="table-state"><CircularProgress size={28} /><Typography color="text.secondary">Loading appointments…</Typography></Box>
        : error ? <Box className="table-state"><Typography color="text.secondary">Appointments are unavailable until the connection is restored.</Typography></Box>
          : recent.length === 0 ? <Box className="table-state"><EventAvailableRoundedIcon color="disabled" /><Typography color="text.secondary">No appointments to show yet.</Typography></Box>
            : <TableContainer><Table aria-label="Recent appointments"><TableHead><TableRow><TableCell>Patient</TableCell><TableCell>Doctor</TableCell><TableCell>Date &amp; time</TableCell><TableCell>Reason</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>{recent.map((appointment) => <TableRow key={appointment.id}>
              <TableCell><Typography sx={{ fontWeight: 600 }}>Patient #{appointment.patient_id}</Typography></TableCell><TableCell>{appointment.doctor_id ? `Doctor #${appointment.doctor_id}` : 'Unassigned'}</TableCell><TableCell>{formatDate(appointment.appointment_date)}</TableCell><TableCell className="reason-cell">{appointment.reason || '—'}</TableCell><TableCell><Chip label={appointment.status || 'Unknown'} size="small" className={`status-chip status-${appointment.status.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} /></TableCell>
            </TableRow>)}</TableBody></Table></TableContainer>}
    </Paper>
  </Stack>
}

function PlaceholderPage({ title }: { title: string }) {
  return <Paper className="placeholder-panel" elevation={0}><Box className="placeholder-icon"><CalendarMonthRoundedIcon /></Box><Typography variant="h5" sx={{ fontWeight: 700 }}>{title}</Typography><Typography color="text.secondary">This section is ready for the next phase of clinic management features.</Typography></Paper>
}

function App() {
  const { mode, setMode, client } = useApiMode()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [connectionResult, setConnectionResult] = useState<{
    client: typeof client
    status: 'connected' | 'offline'
  } | null>(null)
  const connection = connectionResult?.client === client ? connectionResult.status : 'checking'
  const [notice, setNotice] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    client.get<unknown>('/api/doctors', { query: { page: 1, limit: 1 }, signal: controller.signal })
      .then(() => {
        if (!controller.signal.aborted) setConnectionResult({ client, status: 'connected' })
      })
      .catch(() => {
        if (!controller.signal.aborted) setConnectionResult({ client, status: 'offline' })
      })
    return () => controller.abort()
  }, [client, mode])

  const handleModeChange = (event: SelectChangeEvent) => {
    setMode(event.target.value as 'portfolio' | 'demo')
    setNotice(true)
  }

  const drawer = <Box className="sidebar-content">
    <Box className="brand"><Avatar className="brand-mark"><MedicalServicesRoundedIcon /></Avatar><Box><Typography sx={{ fontWeight: 700 }} className="brand-title">Carewell</Typography><Typography variant="caption" className="brand-caption">CLINIC MANAGEMENT</Typography></Box></Box>
    <Typography className="nav-label">WORKSPACE</Typography>
    <Stack component="nav" spacing={0.5} className="nav-list">{navigation.map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}><Icon fontSize="small" /><span>{item.label}</span></NavLink> })}</Stack>
    <Box className="sidebar-footer"><Box className="footer-mark">CW</Box><Box><Typography variant="body2" sx={{ fontWeight: 600 }}>Carewell Clinic</Typography><Typography variant="caption" color="text.secondary">Administration</Typography></Box></Box>
  </Box>

  return <Box className="app-shell">
    <Box component="aside" className="desktop-sidebar" sx={{ width: drawerWidth }}><Box className="sidebar-inner">{drawer}</Box></Box>
    <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} className="mobile-drawer" slotProps={{ paper: { sx: { width: drawerWidth } } }}>{drawer}</Drawer>
    <Box className="main-column">
      <AppBar position="sticky" elevation={0} className="topbar"><Toolbar className="topbar-toolbar">
        <IconButton className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><MenuRoundedIcon /></IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700 }} className="page-title">{pageTitle(location.pathname)}</Typography>
        <Box className="topbar-actions"><Box className={`connection-state ${connection}`}><span className="connection-dot" /><span className="connection-label">{connection === 'checking' ? 'Connecting' : connection === 'connected' ? 'API connected' : 'API unavailable'}</span></Box><FormControl size="small" className="mode-select"><Select value={mode} onChange={handleModeChange} inputProps={{ 'aria-label': 'API mode' }}><MenuItem value="portfolio">Portfolio</MenuItem><MenuItem value="demo">Demo</MenuItem></Select></FormControl><Avatar className="user-avatar">A</Avatar></Box>
      </Toolbar></AppBar>
      <Container maxWidth={false} className="page-content"><Routes><Route path="/" element={<Dashboard />} /><Route path="/patients" element={<PlaceholderPage title="Patients" />} /><Route path="/doctors" element={<PlaceholderPage title="Doctors" />} /><Route path="/appointments" element={<PlaceholderPage title="Appointments" />} /><Route path="*" element={<PlaceholderPage title="Page not found" />} /></Routes></Container>
    </Box>
    <Snackbar open={notice} autoHideDuration={2400} onClose={() => setNotice(false)} message={`Switched to ${mode === 'portfolio' ? 'Portfolio' : 'Demo'} mode`} />
  </Box>
}

export default App
