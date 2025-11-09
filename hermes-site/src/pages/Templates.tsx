import { Add, Delete, Edit, Refresh } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Snackbar,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { AddEditTemplate } from '../components/templates/AddEditTemplate';
import { createTemplate, deleteTemplate, getTemplates } from '../util/api/templates';
import type { Template } from '../util/api/types';

export default function Templates() {
  const [rows, setRows] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [_, setEditRow] = useState<Template | null>(null);

  const [snack, setSnack] = useState<string | null>(null);

  async function refresh() {
    try {
      setLoading(true);
      const data = await getTemplates();
      setRows(data);
      setError(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Failed to load templates');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(data: Partial<Template>) {
    try {
      // Extract the 'TemplateInsert' data that the API expects
      await createTemplate(data);
      setSnack('Template created');
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

//   async function handleUpdate(data: Partial<Template>) {
//     try {
//       // Extract the 'TemplateUpdate' data that the API expects
//       await updateTemplate(data.id!, data);
//       setSnack('Template updated');
//       setEditRow(null);
//       await refresh();
//     } catch (e: unknown) {
//       if (e instanceof Error) {
//         setSnack(e.message);
//       } else {
//         setSnack('Update failed');
//       }
//     }
//   }

  async function handleDelete(id: number) {
    if (!confirm('Delete this template? This action cannot be undone.')) return;
    try {
      await deleteTemplate(id);
      setSnack('Template deleted');
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
          <Typography variant="h4">Email Templates</Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={refresh} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<Add />} onClick={() => setFormOpen(true)}>
              Add template
            </Button>
          </Stack>
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
          <List>
            {rows.length === 0 ? (
                <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    You haven't created any templates yet.
                </Typography>
            ) : (
                rows.map((template) => (
                    <ListItem key={template.id} divider>
                        <ListItemText
                        primary={template.template_name}
                        secondary={template.subject || "No Subject"}
                        />
                        <ListItemSecondaryAction>
                        <Tooltip title="Edit">
                            <IconButton edge="end" aria-label="edit" onClick={() => setEditRow(template)}>
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(template.id)}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))
            )}
          </List>
        )}

        {/* Create dialog */}
        <AddEditTemplate
          open={formOpen}
          initial={null}
          onClose={() => setFormOpen(false)}
          onSubmit={handleCreate}
        />

        {/* Edit dialog */}
        {/* <AddEditTemplate
          open={Boolean(editRow)}
          initial={editRow}
          onClose={() => setEditRow(null)}
          onSubmit={handleUpdate}
        /> */}

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