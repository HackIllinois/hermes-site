import { Add, Delete, Edit, Refresh } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { AddEditSponsor } from '../components/Sponsors/AddEditSponsor';
import { createSponsor, deleteSponsor, getSponsors, updateSponsor } from '../util/api/sponsors';
import { SPONSOR_STATUS_COLORS, SPONSOR_STATUS_DISPLAY_NAMES, SPONSOR_STATUSES, type Sponsor, type SponsorStatus } from '../util/api/types';

export default function SponsorsPage() {
  const [rows, setRows] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SponsorStatus | 'ALL'>('ALL');

  const [formOpen, setFormOpen] = useState(false);
  const [editRow, setEditRow] = useState<Sponsor | null>(null);

  const [snack, setSnack] = useState<string | null>(null);

  async function refresh() {
    try {
      setLoading(true);
      const data = await getSponsors();
      setRows(data);
      setError(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Failed to load');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ =
        !q ||
        r.sponsor_name.toLowerCase().includes(q) ||
        r.sponsor_email.toLowerCase().includes(q) ||
        (r.company_name ?? '').toLowerCase().includes(q) ||
        (r.notes ?? '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'ALL' ? true : r.status === statusFilter;
      return matchesQ && matchesStatus;
    });
  }, [rows, query, statusFilter]);

  async function handleCreate(data: Sponsor) {
    try {
      await createSponsor(data);
      setSnack('Sponsor created');
      setFormOpen(false);
      await refresh();
    } catch (e) {
      if (e instanceof Error) {
        setSnack(e.message);
      } else {
        setSnack('Create failed');
      }
    }
  }

  async function handleUpdate(data: Sponsor) {
    try {
      await updateSponsor(data.sponsor_email, data);
      setSnack('Sponsor updated');
      setEditRow(null);
      await refresh();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setSnack(e.message);
      } else {
        setSnack('Update failed');
      }
    }
  }

  async function handleDelete(email: string) {
    if (!confirm('Delete this sponsor?')) return;
    try {
      await deleteSponsor(email);
      setSnack('Sponsor deleted');
      await refresh();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setSnack(e.message);
      } else {
        setSnack('Delete failed');
      }
    }
  }

  return (
    <Card sx={{ boxShadow: 2, borderRadius: 2, mb: 2, p: 1 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Sponsors</Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={refresh} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<Add />} onClick={() => setFormOpen(true)}>
              Add sponsor
            </Button>
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
          <TextField
            label="Search"
            placeholder="name, email, company, notes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
          />
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SponsorStatus)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="ALL">All</MenuItem>
            {SPONSOR_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {SPONSOR_STATUS_DISPLAY_NAMES[s]}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box px={2} py={3}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.sponsor_email} hover>
                    <TableCell>{r.sponsor_name}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {r.sponsor_email}
                      </Typography>
                    </TableCell>
                    <TableCell>{r.company_name}</TableCell>
                    <TableCell>
                      <Chip size="small" label={SPONSOR_STATUS_DISPLAY_NAMES[r.status]} color={SPONSOR_STATUS_COLORS[r.status] || 'default'} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap title={r.notes ?? ''}>
                        {r.notes || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => setEditRow(r)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(r.sponsor_email)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box py={4} textAlign="center">
                        <Typography color="text.secondary">No sponsors found.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create dialog */}
        <AddEditSponsor
          open={formOpen}
          initial={null}
          onClose={() => setFormOpen(false)}
          onSubmit={handleCreate}
        />

        {/* Edit dialog */}
        <AddEditSponsor
          open={Boolean(editRow)}
          initial={editRow}
          onClose={() => setEditRow(null)}
          onSubmit={handleUpdate}
        />

        <Snackbar
          open={Boolean(snack)}
          autoHideDuration={3000}
          onClose={() => setSnack(null)}
          message={snack ?? ''}
        />
      </CardContent>
    </Card>
  );
}
