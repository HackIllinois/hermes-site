import { useEffect, useState } from "react";
import type { ScheduledSendTableResponse, Task } from "../util/api/types";
import type { Email } from "../util/api/types";
import { Box, Button, CircularProgress, Divider, Modal, Paper, Stack, Typography } from "@mui/material";
import ReplyEmailModal from "./ReplyEmailModal";
import { getEmails, unscheduleEmail } from "../util/api/emails";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { Chip } from "@mui/material";

interface TaskDetailModalProps {
    task: Task;
    open: boolean;
    onClose: () => void;
}

dayjs.extend(relativeTime);

export default function TaskDetailModal({ task, open, onClose }: TaskDetailModalProps) {
    const [emails, setEmails] = useState<Email[]>([]);
    const [scheduledSends, setScheduledSends] = useState<ScheduledSendTableResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [emailToReplyTo, setEmailToReplyTo] = useState<Email | null>(null);
    const [isCancelling, setIsCancelling] = useState<number | null>(null);

    const fetchEmails = async () => {
        setIsLoading(true);
        try {
          const data = await getEmails(task.id);
          setEmails(data.sent_emails);
          setScheduledSends(data.scheduled_sends);
        } catch (error) {
          console.error("Failed to fetch emails", error);
          setEmails([]);
          setScheduledSends([]);
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

    const handleCancelSend = async (scheduleId: number) => {
      if (window.confirm("Are you sure you want to cancel this scheduled email?")) {
          setIsCancelling(scheduleId);
          try {
              await unscheduleEmail(scheduleId);
              // Success, refresh the list to remove it
              fetchEmails(); 
          } catch (error) {
              console.error("Failed to cancel email", error);
              // You could show a snackbar error here
          } finally {
              setIsCancelling(null);
          }
      }
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

    const renderRecipients = (jobData: any) => {
      const to = (jobData.to as string[] | undefined);
      const cc = (jobData.cc as string[] | undefined);
      const bcc = (jobData.bcc as string[] | undefined);

      return (
          <>
              {/* 'to' only exists on new sends. Replies are implicit. */}
              {to && to.length > 0 && (
                  <Typography variant="body2"><strong>To:</strong> {to.join(', ')}</Typography>
              )}
              {cc && cc.length > 0 && (
                  <Typography variant="body2"><strong>CC:</strong> {cc.join(', ')}</Typography>
              )}
              {bcc && bcc.length > 0 && (
                  <Typography variant="body2"><strong>BCC:</strong> (Hidden) {bcc.join(', ')}</Typography>
              )}
          </>
      )
    }
    
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

                  {scheduledSends.length > 0 && scheduledSends.map(send => (
                    <Box 
                      key={send.id} 
                      sx={{ 
                        mb: 2, p: 2, 
                        border: '1px solid #ed6c02', // Orange border
                        backgroundColor: '#add8e6', // Light blue bg
                        borderRadius: 2, 
                        position: 'relative' 
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Chip 
                          label={`Scheduled to send at ${dayjs(send.send_at).format('h:mm A on M/D/YYYY')}`} 
                          color="warning" 
                          size="small"
                        />
                        <Button 
                          variant="contained" 
                          color="error" 
                          size="small"
                          disabled={isCancelling === send.id}
                          onClick={() => handleCancelSend(send.id)}
                        >
                          {isCancelling === send.id ? <CircularProgress size={20} /> : "Cancel"}
                        </Button>
                      </Stack>
                      
                      <Typography variant="body2">
                        <strong>From:</strong> (You, when sent)
                      </Typography>
                      {/* Render To/Cc/Bcc */}
                      {renderRecipients(send.job_data)}
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mt: 2, 
                          whiteSpace: 'pre-wrap', 
                          fontFamily: 'monospace',
                          opacity: 0.8 
                        }}
                      >
                        {(send.job_data as any).body}
                      </Typography>
                    </Box>
                  ))}

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