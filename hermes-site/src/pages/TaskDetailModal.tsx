import { useEffect, useState } from "react";
import type { Task } from "../util/api/types";
import type { Email } from "../util/api/types";
import { Box, Button, CircularProgress, Divider, Modal, Paper, Typography } from "@mui/material";
import ReplyEmailModal from "./ReplyEmailModal";
import { getEmails } from "../util/api/emails";

interface TaskDetailModalProps {
    task: Task;
    open: boolean;
    onClose: () => void;
}

export default function TaskDetailModal({ task, open, onClose }: TaskDetailModalProps) {
    const [emails, setEmails] = useState<Email[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [emailToReplyTo, setEmailToReplyTo] = useState<Email | null>(null);

    const fetchEmails = async () => {
        setIsLoading(true);
        try {
          const data = await getEmails(task.id);
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
    }, [open, task.id]);
    
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
    
    // ✨ We'll grab the subject from the first available email.
    const threadSubject = emails.length > 0 ? emails[0].subject : null;

    return (
      <>
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
              <Typography variant="h5">Email History for Task #{task.id}</Typography>

              {/* ✨ ADDED: Display the thread's subject here if it exists */}
              {threadSubject && (
                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                  {threadSubject}
                </Typography>
              )}

              <Button onClick={fetchEmails} disabled={isLoading} sx={{ my: 1 }}>
                {isLoading ? 'Loading...' : 'Refresh History 🔄'}
              </Button>
              <Divider sx={{ my: 1 }} />
              {isLoading ? (
                <CircularProgress />
              ) : (
                <Paper sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
                  {emails.length > 0 ? emails.map(email => (
                    <Box key={email.gmail_message_id} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, position: 'relative' }}>
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
                      
                      {/* ✨ REMOVED: The subject line from each individual email card is gone */}
                      
                      <Typography variant="body2" sx={{ mt: 2, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{email.body}</Typography>
                    </Box>
                  )) : <Typography>No email history found for this task.</Typography>}
                </Paper>
              )}
            </Box>
        </Modal>

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