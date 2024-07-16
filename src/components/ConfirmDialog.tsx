import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const ConfirmDialog = (props: any) => {
    const {
        title,
        children,
        open,
        setOpen,
        onConfirm,
        cancelLabel = 'Cancel',
        confirmLabel = 'Confirm',
        confirmBtnColor = 'error'
    } = props;
    return (
        <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="confirm-dialog">
            <DialogTitle id="confirm-dialog">{title}</DialogTitle>
            <DialogContent>{children}</DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" sx={{ borderRadius: 30 }} onClick={() => setOpen(false)}>
                    {cancelLabel}
                </Button>
                <Button
                    variant="contained"
                    sx={{ borderRadius: 30 }}
                    onClick={() => {
                        setOpen(false);
                        onConfirm();
                    }}
                    color={confirmBtnColor}
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
