import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material'

/**
 * Reusable confirmation dialog
 * @param {boolean} open - whether dialog is open
 * @param {string} title - dialog title
 * @param {string[]} items - list of data items to delete
 * @param {boolean} loading - whether confirm action is in progress
 * @param {function} onConfirm - callback for confirm
 * @param {function} onCancel - callback for cancel
 */
const ConfirmationDialog = ({ open, title, items = [], loading = false, onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          This action will permanently delete the following data:
        </Typography>
        <List dense>
          {items.map(item => (
            <ListItem key={item}>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
        <Typography variant="body2" color="error">
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog