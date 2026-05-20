import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert
} from '@mui/material';

const MyBookings = () => {
  const token = sessionStorage.getItem("JWT");
  const [bookings, setBookings] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancellationMessage, setCancellationMessage] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const err = await response.json();
          console.error("Booking fetch failed:", err.message);
          return;
        }

        const data = await response.json();
        setBookings(data.bookings || []);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      }
    };

    fetchBookings();
  }, [token]);

  const confirmCancel = (id) => {
    setSelectedBookingId(id);
    setOpenDialog(true);
  };

  const cancelBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${selectedBookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setBookings((prev) => prev.filter((booking) => booking._id !== selectedBookingId));
        setCancellationMessage("Booking cancelled. A confirmation email has been sent to your email address.");
      } else {
        const err = await response.json();
        console.error("Cancellation failed:", err.message);
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
    } finally {
      setOpenDialog(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        My Bookings
      </Typography>

      <Box display="flex" justifyContent="center">
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '22%' }}><strong>Sr. No.</strong></TableCell>
                <TableCell sx={{ width: '22%' }}><strong>Name</strong></TableCell>
                <TableCell sx={{ width: '22%' }}><strong>Booking Date</strong></TableCell>
                <TableCell sx={{ width: '22%' }}><strong>People</strong></TableCell>
                <TableCell sx={{ width: '22%' }}><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking, index) => (
                <TableRow key={booking._id}>
                  <TableCell sx={{ width: '22%' }}>{index + 1}</TableCell>
                  <TableCell sx={{ width: '22%' }}>{booking.restaurant.name}</TableCell>
                  <TableCell sx={{ width: '22%' }}>
                    {new Date(booking.booking_time).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ width: '22%' }}>{booking.number_of_people}</TableCell>
                  <TableCell sx={{ width: '22%' }}>
                    <Button
                      color="error"
                      variant="outlined"
                      size="small"
                      onClick={() => confirmCancel(booking._id)}
                    >
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {cancellationMessage && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {cancellationMessage}
        </Alert>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Are you sure you want to cancel this booking?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>No</Button>
          <Button onClick={cancelBooking} color="error">Yes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyBookings;
