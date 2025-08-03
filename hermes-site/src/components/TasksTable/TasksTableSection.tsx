import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';

interface Task {
  companyName: string;
  contactName: string;
  status: string;
  taskNeeded: string;
  dueBy: string;
  lastContacted: string;
  assignee: string;
}

const rows: Task[] = [
  {
    companyName: 'Capital One',
    contactName: 'John Doe',
    status: '1st Ping',
    taskNeeded: 'Send 2nd ping',
    dueBy: 'today, 3 pm',
    lastContacted: '10/24/2024',
    assignee: 'Jane Doe',
  },
  {
    companyName: 'Capital One',
    contactName: 'John Doe',
    status: '1st Ping',
    taskNeeded: 'Respond to message',
    dueBy: 'today, 4 pm',
    lastContacted: '8/24/2024',
    assignee: 'Jane Doe',
  },
  {
    companyName: 'Capital One',
    contactName: 'John Doe',
    status: '1st Ping',
    taskNeeded: 'Respond to message',
    dueBy: 'today, 3 pm',
    lastContacted: '10/24/2024',
    assignee: 'Jane Doe',
  },
];

type TaskTableSectionProps = {
    name: string;
}

export default function TasksTableSection({ name }: TaskTableSectionProps) {
  return (
    <>
        <Typography fontWeight={500} sx={{mb: 1}}>
            {name}
        </Typography>
        <TableContainer component={Paper} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 2, mb: 4 }}>
        <Table aria-label="needs attention table">
            <TableHead>
            <TableRow>
                <TableCell>Company Name</TableCell>
                <TableCell>Contact Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Task needed</TableCell>
                <TableCell>Due by</TableCell>
                <TableCell>Last contacted</TableCell>
                <TableCell>Assignee</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {rows.map((row, idx) => (
                <TableRow
                key={`${row.companyName}-${idx}`}
                sx={{ '&:last-child td': { border: 0 } }}
                >
                <TableCell component="th" scope="row">
                    {row.companyName}
                </TableCell>
                <TableCell>{row.contactName}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.taskNeeded}</TableCell>
                <TableCell sx={{ color: 'error.main' }}>
                    {row.dueBy}
                </TableCell>
                <TableCell>{row.lastContacted}</TableCell>
                <TableCell>{row.assignee}</TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </TableContainer>
    </>
  );
}
