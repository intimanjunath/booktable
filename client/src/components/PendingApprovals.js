import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  useMediaQuery,
  useTheme,
  Container
  //   Button, // Import Button
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestaurantDescription from "../components/PendingAndApprovalDesc"; // Import the description component

// This component displays lists of restaurants awaiting approval and approved restaurants,
// fetches data, provides actions, makes cards clickable, and shows a description view.
const PendingApprovalList = ({ onApprove, onReject, onEdit, onDelete }) => {
  // Removed onRestaurantClick prop as it's handled internally

  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [approvedRestaurants, setApprovedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null); // State to hold the selected restaurant for description
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const token = sessionStorage.getItem("JWT");

  useEffect(() => {
    
    const fetchPendingRestaurants = async () => {
      try {
        const token = sessionStorage.getItem("JWT");
        const response = await fetch("api/restaurants/pending", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        setPendingRestaurants(data);
      } catch (error) {
        console.error("Error fetching pending restaurants:", error);
        setError("Failed to load pending restaurants. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    const storedApproved = sessionStorage.getItem("approvedRestaurants");
    if (storedApproved) {
      setApprovedRestaurants(JSON.parse(storedApproved));
    }
    fetchPendingRestaurants();
  }, []);

  const fetchUpdateRestaurants = async (restaurantId) => {
    try {
      const response = await fetch(`api/restaurants/${restaurantId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching pending restaurants:", error);
    } 
  };

  const handleGoBack = () => {
    setSelectedRestaurant(null); // Clear the selected restaurant to show lists
  };
  // Handle approving a pending restaurant
 const handleApproveRestaurant = async (restaurantToApprove) => {
  try {
    const token = sessionStorage.getItem("JWT");

    const response = await fetch(
      `/api/restaurants/${restaurantToApprove._id}/approve`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to approve: ${response.status} - ${errorText}`);
    }

    // Update local state
    setSelectedRestaurant(null);
    setPendingRestaurants((prev) =>
      prev.filter((rest) => rest._id !== restaurantToApprove._id)
    );
    const updatedApproved = [
  ...approvedRestaurants,
  { ...restaurantToApprove, status: "approved" },
];

setApprovedRestaurants(updatedApproved);
sessionStorage.setItem("approvedRestaurants", JSON.stringify(updatedApproved));


    if (onApprove) {
      onApprove(restaurantToApprove);
    }
  } catch (error) {
    console.error("Error approving restaurant:", error);
    alert("Failed to approve restaurant. Please try again.");
  }
};


  // Handle rejecting a pending restaurant
  const handleRejectRestaurant = async (restaurantToReject) => {
  try {
    const token = sessionStorage.getItem("JWT");

    const response = await fetch(`/api/restaurants/${restaurantToReject._id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete: ${response.status}`);
    }

    // Update UI
    setSelectedRestaurant(null);
    setPendingRestaurants(
      pendingRestaurants.filter((rest) => rest._id !== restaurantToReject._id)
    );

    if (onReject) {
      onReject(restaurantToReject);
    }
  } catch (error) {
    console.error("Error rejecting restaurant:", error);
    alert("Failed to reject restaurant. Please try again.");
  }
};


  // Handle editing an approved restaurant (placeholder)
  const handleEditApproved = (restaurantToEdit) => {
    console.log("Editing approved restaurant:", restaurantToEdit);
    // Call the prop function if provided (e.g., to open an edit form in the parent)
    if (onEdit) {
      onEdit(restaurantToEdit, true);
    }
  };

  // Handle deleting an approved restaurant (placeholder)
  const handleDeleteApproved = async (restaurantToDelete) => {
    try {
      // Replace with your actual API call to delete the restaurant
      // Example: await fetch(`/api/restaurants/${restaurantToDelete._id}`, { method: 'DELETE' });

      // For demo: Update local state
      setApprovedRestaurants(
        approvedRestaurants.filter(
          (rest) => rest._id !== restaurantToDelete._id
        )
      );

      // Call the prop function if provided
      if (onDelete) {
        onDelete(restaurantToDelete, true);
      }
    } catch (error) {
      console.error("Error deleting approved restaurant:", error);
      // Handle error
    }
  };

  // Handle click on a restaurant item to show description
  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant); // Set the selected restaurant to display description
  };

  // Handle going back from the description page
 

  if (loading) {
    return (
      <Paper
        elevation={2}
        sx={{ p: { xs: 2, md: 3 }, borderRadius: "8px", textAlign: "center" }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading restaurants...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: "8px" }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  // Conditionally render description page or lists
  if (selectedRestaurant) {
    return (
      <RestaurantDescription
        restaurant={selectedRestaurant}
        onGoBack={handleGoBack}
        onApproveRestaurant={handleApproveRestaurant}
        onRejectRestaurant={handleRejectRestaurant}
      />
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, md: 8 } }}>
    <Paper
      elevation={2}
      sx={{ p: { xs: 2, md: 3 }, borderRadius: "8px", border: "none", width: `${!isMobile ? '840px': 'inherit'}`}}
    >
      {/* Restaurants Awaiting Approval */}
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ mb: 3, fontSize: { xs: "1.1rem", md: "1.4rem" } }}
      >
        Restaurants Awaiting Approval ({pendingRestaurants.length})
      </Typography>

      {pendingRestaurants.length === 0 ? (
        <Typography
          variant="body1"
          align="center"
          sx={{
            color: "text.secondary",
            fontSize: { xs: "0.875rem", md: "1rem" },
          }}
        >
          No restaurants awaiting approval.
        </Typography>
      ) : (
        <List sx={{ border: "none", borderRadius: "8px", mb: 4 }}>
          {pendingRestaurants.map((restaurant) => (
            <ListItem
              key={`pending-${restaurant._id}`}
              button // Make the ListItem clickable
              onClick={() => handleRestaurantClick(restaurant)} // Add click handler
              secondaryAction={
                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 0.5, md: 1.5 },
                    flexDirection: { xs: "column", md: "row" },
                  }}
                >
                  {/* Approve and Reject buttons remain for pending
                  <IconButton
                    edge="end"
                    aria-label="approve"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApproveLocal(restaurant);
                    }} // Stop propagation to prevent card click
                    size="small"
                    color="success"
                  ></IconButton>
                  <IconButton
                    edge="end"
                    aria-label="reject"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRejectLocal(restaurant);
                    }} // Stop propagation
                    size="small"
                    color="error"
                  ></IconButton> */}
                </Box>
              }
              sx={{
                border: "1px solid #eee",
                borderRadius: "8px",
                mb: 2,
                px: { xs: 1, md: 2 },
                backgroundColor: "#fafafa",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "center" },
                py: { xs: 1.5, md: 2 },
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                },
              }}
            >
              <ListItemText
                primary={restaurant.name}
                secondary={
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      fontSize: { xs: "0.75rem", md: "0.875rem" },
                      color: "text.secondary",
                    }}
                  >
                    {restaurant.address} | {restaurant.contactInfo} |{" "}
                    {restaurant.hours}
                  </Box>
                }
                primaryTypographyProps={{
                  variant: "body1",
                  sx: {
                    fontWeight: "bold",
                    fontSize: { xs: "0.875rem", md: "1rem" },
                  },
                }}
                sx={{ mr: { md: 2 }, mb: { xs: 1, md: 0 } }}
              />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: { xs: 1, md: 2 },
                  flexWrap: "wrap",
                }}
              >
                {/* Cuisine Type */}
                {restaurant.cuisineType && (
                  <Chip
                    label={`Cuisine: ${restaurant.cuisineType}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Approved Restaurants List */}
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ mb: 3, fontSize: { xs: "1.1rem", md: "1.4rem" } }}
      >
        Approved Restaurants ({approvedRestaurants.length})
      </Typography>
      {approvedRestaurants.length === 0 ? (
        <Typography
          variant="body1"
          align="center"
          sx={{
            color: "text.secondary",
            fontSize: { xs: "0.875rem", md: "1rem" },
          }}
        >
          No approved restaurants yet.
        </Typography>
      ) : (
        <List sx={{ border: "none", borderRadius: "8px" }}>
          {approvedRestaurants.map((restaurant) => (
            <ListItem
              key={`approved-${restaurant._id}`}
              button // Make the ListItem clickable
              onClick={() => handleRestaurantClick(restaurant)} // Add click handler
              secondaryAction={
                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 0.5, md: 1.5 },
                    flexDirection: { xs: "column", md: "row" },
                  }}
                >
                  {/* Edit button for approved items */}
                </Box>
              }
              sx={{
                border: "1px solid #eee",
                borderRadius: "8px",
                mb: 2,
                px: { xs: 1, md: 2 },
                backgroundColor: "#fafafa",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "center" },
                py: { xs: 1.5, md: 2 },
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                },
              }}
            >
              <ListItemText
                primary={restaurant.name}
                secondary={
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      fontSize: { xs: "0.75rem", md: "0.875rem" },
                      color: "text.secondary",
                    }}
                  >
                    {restaurant.address} | {restaurant.contactInfo} |{" "}
                    {restaurant.hours}
                  </Box>
                }
                primaryTypographyProps={{
                  variant: "body1",
                  sx: {
                    fontWeight: "bold",
                    fontSize: { xs: "0.875rem", md: "1rem" },
                  },
                }}
                sx={{ mr: { md: 2 }, mb: { xs: 1, md: 0 } }}
              />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: { xs: 1, md: 2 },
                  flexWrap: "wrap",
                }}
              >
                {/* Cuisine Type */}
                {restaurant.cuisineType && (
                  <Chip
                    label={`Cuisine: ${restaurant.cuisineType}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
    </Container>
  );
};

export default PendingApprovalList;
