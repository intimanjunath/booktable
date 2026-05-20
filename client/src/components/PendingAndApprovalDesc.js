import React, {useState} from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Card,
  CardMedia,
  CardContent,
  Container,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Import Approve icon
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'; // Import Reject icon
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

// This component displays the detailed information for a single restaurant.
// It receives a 'restaurant' object as a prop and functions for actions.
const RestaurantDescription = ({ restaurant, onGoBack, onApproveRestaurant, onRejectRestaurant }) => { // Added action props
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);

  // If no restaurant data is provided, display a message
  if (!restaurant) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, md: 8 } }}>
        <Paper elevation={3} sx={{ p: { xs: 4, md: 6 }, borderRadius: '8px', textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Select a restaurant to see details.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Helper function to format time slots (assuming "HH:MM" format)
  const formatTimeSlots = (times) => {
    if (!times || times.length === 0) return 'Not available';
    return times.map(time => {
      const [hour, minute] = time.split(':');
      const hourInt = parseInt(hour, 10);
      const ampm = hourInt >= 12 ? 'PM' : 'AM';
      const formattedHour = hourInt % 12 || 12; // Convert 0 to 12 for 12 AM/PM
      return `${formattedHour}:${minute} ${ampm}`;
    }).join(', ');
  };
  

  // Handle Approve button click
  const handleApproveClick = () => {
      if (onApproveRestaurant) {
          onApproveRestaurant(restaurant);
      }
  };

  // Handle Reject button click
  const handleRejectClick = () => {
      if (onRejectRestaurant) {
          onRejectRestaurant(restaurant);
      }
  };

  const confirmReject = () => {
  setOpenRejectDialog(false);
  if (onRejectRestaurant) {
    onRejectRestaurant(restaurant);
  }
};

const cancelReject = () => {
  setOpenRejectDialog(false);
};

const confirmApprove = () => {
  setOpenApproveDialog(false);
  if (onApproveRestaurant) {
    onApproveRestaurant(restaurant);
  }
};

const cancelApprove = () => {
  setOpenApproveDialog(false);
};


  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, md: 8 } }}>
      <Card elevation={3} sx={{ borderRadius: '8px' }}>
        {/* Go Back Button */}
        <Box sx={{ p: 2 }}> {/* Add padding around the button */}
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onGoBack} // Call the onGoBack function when clicked
            size="small"
          >
            Go Back
          </Button>
        </Box>

        {/* Restaurant Main Image */}
        {restaurant.main_image && (
          <CardMedia
            component="img"
            height="300" // Adjust height as needed
            image={restaurant.main_image}
            alt={`Image of ${restaurant.name}`}
            sx={{ objectFit: 'cover' }}
          />
        )}

        <CardContent sx={{ p: { xs: 3, md: 4 } }}> {/* Responsive padding */}
          {/* Restaurant Name */}
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            {restaurant.name}
          </Typography>

          {/* Basic Info (Address, Contact, Hours) */}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.9rem', md: '1rem' } }}>
            {restaurant.address} | {restaurant.contactInfo} | {restaurant.hours}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Cuisine Type and Cost Rating */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {restaurant.cuisineType && (
              <Chip label={`Cuisine: ${restaurant.cuisineType}`} variant="outlined" color="primary" size="small" />
            )}
            {restaurant.costRating && (
              <Chip label={`Cost: ${restaurant.costRating}`} variant="outlined" color="secondary" size="small" />
            )}
          </Box>

          {/* Description */}
          {restaurant.description && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}>
                Description
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.9rem' } }}>
                {restaurant.description}
              </Typography>
            </Box>
          )}

          {/* Available Times (Time Slots) */}
          {restaurant.availableTimes && restaurant.availableTimes.length > 0 && (
             <Box>
               <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}>
                 Available Times
               </Typography>
               <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.9rem' } }}>
                 {formatTimeSlots(restaurant.availableTimes)}
               </Typography>
             </Box>
          )}

          {/* Note: Table information is excluded as requested */}

           <Divider sx={{ my: 3 }} />

           {/* Approve and Reject Buttons */}
           {/* Conditionally render these buttons if the restaurant is pending approval */}
           {/* Assuming your restaurant object has a 'status' property */}
           {restaurant.status === 'Pending' && (
             <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  color="success" // Green color
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={() => setOpenApproveDialog(true)}
                >
                  Approve
                </Button>
                 <Button
                  variant="contained"
                  color="error" // Red color
                  startIcon={<CancelOutlinedIcon />}
                  onClick={() => setOpenRejectDialog(true)}
                >
                  Reject
                </Button>
             </Box>
           )}


        </CardContent>
      </Card>
      <Dialog
  open={openRejectDialog}
  onClose={cancelReject}
  aria-labelledby="reject-dialog-title"
>
  <DialogTitle id="reject-dialog-title">Confirm Rejection</DialogTitle>
  <DialogContent>
    <Typography>
      Are you sure you want to reject and delete <strong>{restaurant.name}</strong>?
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={cancelReject} variant="outlined">
      Cancel
    </Button>
    <Button onClick={confirmReject} variant="contained" color="error">
      Reject
    </Button>
  </DialogActions>
</Dialog>
<Dialog
  open={openApproveDialog}
  onClose={cancelApprove}
  aria-labelledby="approve-dialog-title"
>
  <DialogTitle id="approve-dialog-title">Confirm Approval</DialogTitle>
  <DialogContent>
    <Typography>
      Are you sure you want to approve <strong>{restaurant.name}</strong>?
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={cancelApprove} variant="outlined">
      Cancel
    </Button>
    <Button onClick={confirmApprove} variant="contained" color="success">
      Approve
    </Button>
  </DialogActions>
</Dialog>

    </Container>
  );
};

export default RestaurantDescription;
