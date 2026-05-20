import React, { useEffect, useState } from "react";
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
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const ManageAllRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);

  const token = sessionStorage.getItem("JWT");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch("/api/restaurants?status=Approved", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch restaurants");
        const data = await res.json();
        setRestaurants(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load approved restaurants.");
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [token]);

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/restaurants/${restaurantToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Delete failed");

      setRestaurants((prev) =>
        prev.filter((r) => r._id !== restaurantToDelete._id)
      );
      setOpenDialog(false);
      setRestaurantToDelete(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const cancelDelete = () => {
    setOpenDialog(false);
    setRestaurantToDelete(null);
  };

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading approved restaurants...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, px: { xs: 2, md: 8 } }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: "8px", width: !isMobile ? "840px" : "100%" }}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ fontSize: { xs: "1.1rem", md: "1.4rem" }, mb: 3 }}
        >
          Approved Restaurants ({restaurants.length})
        </Typography>

        {restaurants.length === 0 ? (
          <Typography align="center" sx={{ color: "text.secondary" }}>
            No approved restaurants.
          </Typography>
        ) : (
          <List>
            {restaurants.map((restaurant) => (
              <ListItem
                key={restaurant._id}
                sx={{
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  mb: 2,
                  px: { xs: 1, md: 2 },
                  backgroundColor: "#fafafa",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  py: { xs: 1.5, md: 2 },
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                  },
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {restaurant.name}
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {restaurant.address} | {restaurant.contactInfo} | {restaurant.hours}
                  </Typography>

                  <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        mt: 1,
                      }}
                    >
                      <Chip
                        label={`Cuisine: ${restaurant.cuisineType || "N/A"}`}
                        size="small"
                        variant="outlined"
                      />
                    
                      <IconButton
                        onClick={() => {
                          setRestaurantToDelete(restaurant);
                          setOpenDialog(true);
                        }}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={cancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{restaurantToDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} variant="outlined">
            Cancel
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageAllRestaurants;
