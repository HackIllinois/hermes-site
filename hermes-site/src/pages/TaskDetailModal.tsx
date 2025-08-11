import { useEffect, useState } from "react";
import type { Task } from "../types/tasks";
import type { Email } from "../types/emails";
import { BASE_BACKEND_URL } from "../config";
import { Box, Button, CircularProgress, Divider, Modal, Paper, Typography } from "@mui/material";
import ReplyEmailModal from "./ReplyEmailModal"; // ✨ Import the new modal

interface TaskDetailModalProps {
    task: Task;
    open: boolean;
    onClose: () => void;
}

export default function TaskDetailModal({ task, open, onClose }: TaskDetailModalProps) {
    const [emails, setEmails] = useState<Email[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // ✨ State to manage which email is being replied to, and thus which modal to open
    const [emailToReplyTo, setEmailToReplyTo] = useState<Email | null>(null);

    const fetchEmails = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${BASE_BACKEND_URL}/emails/task/${task.id}`, { 
            credentials: 'include' 
          });

          if (!response.ok) {
            throw new Error('Failed to fetch email thread');
          }
          
          const data: Email[] = await response.json();
          setEmails(data);
        } catch (error) {
          console.error("Failed to fetch emails", error);
          setEmails([]);
        } finally {
          setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchEmails();
        }
    }, [open, task.id]); // Using task.id is slightly more stable
    
    // ✨ Handlers for opening and closing the reply modal
    const handleOpenReplyModal = (email: Email) => {
        setEmailToReplyTo(email);
    };
    const handleCloseReplyModal = () => {
        setEmailToReplyTo(null);
    };

    const modalStyle = {
      position: 'absolute' as 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '70vw',
      bgcolor: 'background.paper',
      border: '2px solid #000',
      boxShadow: 24,
      p: 4,
    };

    return (
      <>
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
              <Typography variant="h5">Email History for Task #{task.id}</Typography>
              <Button onClick={fetchEmails} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Refresh History 🔄'}
              </Button>
              <Divider sx={{ my: 2 }} />
              {isLoading ? (
                <CircularProgress />
              ) : (
                <Paper sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
                  {emails.length > 0 ? emails.map(email => (
                    <Box key={email.gmail_message_id} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, position: 'relative' }}>
                      {/* ✨ Add Reply button to each email card */}
                      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                          <Button variant="outlined" size="small" onClick={() => handleOpenReplyModal(email)}>
                              Reply
                          </Button>
                      </Box>
                      
                      <Typography variant="body2"><strong>From:</strong> {email.sender_email}</Typography>
                      <Typography variant="body2"><strong>To:</strong> {email.to_recipients?.join(', ')}</Typography>
                      {email.cc_recipients && email.cc_recipients.length > 0 && (
                        <Typography variant="body2"><strong>CC:</strong> {email.cc_recipients.join(', ')}</Typography>
                      )}
                      <Typography variant="subtitle1" sx={{my: 1}}><strong>Subject:</strong> {email.subject}</Typography>
                      <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{email.body}</Typography>
                    </Box>
                  )) : <Typography>No email history found for this task.</Typography>}
                </Paper>
              )}
            </Box>
        </Modal>

        {/* ✨ Render the Reply Modal conditionally */}
        {emailToReplyTo && (
            <ReplyEmailModal
                emailToReplyTo={emailToReplyTo}
                open={!!emailToReplyTo}
                onClose={handleCloseReplyModal}
                onEmailSent={fetchEmails}
            />
        )}
      </>
    );
}