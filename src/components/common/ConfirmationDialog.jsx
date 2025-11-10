import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

export default function ConfirmationDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Delete", // Default text
    confirmButtonColor = "#ef4444" // Default red color
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                style: {
                    backgroundColor: '#2a2a2a',
                    color: '#f1f1f1',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    minWidth: '400px' // Ensure it's not too narrow
                },
            }}
        >
            <DialogTitle style={{ fontWeight: 'bold', borderBottom: '1px solid #333' }}>{title}</DialogTitle>
            <DialogContent style={{ marginTop: '1rem' }}>
                <DialogContentText style={{ color: '#d4d4d8', fontSize: '1rem' }}>
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions style={{ padding: '1rem', borderTop: '1px solid #333', marginTop: '1rem' }}>
                <Button
                    onClick={onClose}
                    style={{
                        color: '#a1a1aa',
                        fontWeight: '600',
                        textTransform: 'none',
                        fontSize: '0.95rem'
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    style={{
                        backgroundColor: confirmButtonColor,
                        color: 'white', // Always white text for colored buttons
                        fontWeight: '600',
                        padding: '6px 16px',
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        borderRadius: '6px'
                    }}
                    autoFocus
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}