import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, FormControl, FormControlLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import AuthLegalLinks from '../components/AuthLegalLinks';
import HackLogoLink from '../components/HackIllinoisLogo';
import { getTeams, updateMyTeam } from '../util/api/profiles';
import type { Team } from '../util/api/types';

export default function TeamSelection() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const fetchedTeams = await getTeams();
        setTeams(fetchedTeams);

        if (fetchedTeams.length > 0) {
          setSelectedTeamId(String(fetchedTeams[0].id));
        }
      } catch (error) {
        console.error('Failed to load teams', error);
        setErrorMessage('We could not load teams right now. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, []);

  const handleSubmit = async () => {
    if (!selectedTeamId) {
      setErrorMessage('Please select a team before continuing.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      await updateMyTeam(Number(selectedTeamId));
      window.location.assign('/app');
    } catch (error) {
      console.error('Failed to save team', error);
      setErrorMessage('We could not save your team. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
        px: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 520, boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="flex-start" sx={{ mb: 3 }}>
            <HackLogoLink />
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
            <BoltIcon sx={{ fontSize: 52, color: '#979797ff' }} />
            <Typography variant="h3" fontWeight="bold">
              Hermes
            </Typography>
          </Stack>

          <Typography variant="h5" textAlign="center" gutterBottom>
            Choose your team
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            We&apos;ll use this to keep your sponsor tasks, email threads, and ownership in the right workspace.
          </Typography>

          {errorMessage ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          ) : null}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : teams.length === 0 ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              No teams are available yet. Please ask an admin to create one in Supabase.
            </Alert>
          ) : (
            <FormControl fullWidth>
              <RadioGroup value={selectedTeamId} onChange={(event) => setSelectedTeamId(event.target.value)}>
                {teams.map((team) => (
                  <FormControlLabel
                    key={team.id}
                    value={String(team.id)}
                    control={<Radio />}
                    label={team.name}
                    sx={{
                      border: '1px solid #d9d9d9',
                      borderRadius: 2,
                      mx: 0,
                      mb: 1.5,
                      px: 1,
                      py: 0.5,
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            disabled={isLoading || isSaving || teams.length === 0}
            onClick={handleSubmit}
          >
            {isSaving ? 'Saving...' : 'Continue'}
          </Button>

          <AuthLegalLinks />
        </CardContent>
      </Card>
    </Box>
  );
}
