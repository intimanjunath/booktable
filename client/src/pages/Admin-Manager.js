import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  CircularProgress, // Import CircularProgress for loading
  Alert, // Import Alert for errors
  Grid, // Import Grid for layout
  MenuItem, // Import MenuItem for dropdown
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";


const RestaurantManager = () => {
  // State for the form inputs
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [cuisine, setCuisine] = useState(""); // State for single cuisine input
  const [mainImageUrl, setMainImageUrl] = useState(""); // State for main image URL
  const [hours, setHours] = useState(""); // State for hours
  const [description, setDescription] = useState(""); // State for description
  const [costRating, setCostRating] = useState("REGULAR"); // Changed from "MODERATE" to "REGULAR"
  const [additionalImageUrls, setAdditionalImageUrls] = useState(""); // State for additional image URLs (comma-separated)
  const [googlePlaceId, setGooglePlaceId] = useState(""); // State for Google Place ID
  const [resId, setResId] = useState("");
  const [location, setLocation] = useState(""); // State for location

  // State for Available Times
  const [currentTimeSlot, setCurrentTimeSlot] = useState("");
  const [editingTimeSlots, setEditingTimeSlots] = useState([]);

  // State for Tables
  const [currentTableSize, setCurrentTableSize] = useState("");
  const [currentTableCount, setCurrentTableCount] = useState("");
  const [editingTables, setEditingTables] = useState([]);

  // State for the list of "My Restaurants" fetched from API
  const [myRestaurants, setMyRestaurants] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for API call
  const [error, setError] = useState(null); // Error state for API call

  // State for the restaurant being edited (null if creating new)
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  // State to track if we are editing an existing restaurant from the "My Restaurants" list
  const [isEditingMyRestaurant, setIsEditingMyRestaurant] = useState(false);
  const [showFormSection, setShowFormSection] = useState(true);
  const [showViewSection, setShowViewSection] = useState(false);
  const toggleFormSection = () => {
    setShowFormSection(true);
    setShowViewSection(false);
  };

  const toggleViewSection = () => {
    setShowFormSection(false);
    setShowViewSection(true);
  };
  const token = sessionStorage.getItem("JWT");
  const fetchMyRestaurants = async () => {
    try {
      const response = await fetch("api/restaurants/my", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Assuming the API returns an array of restaurant objects directly
      setMyRestaurants(data);
    } catch (error) {
      console.error("Error fetching my restaurants:", error);
      setError("Failed to load your restaurants. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after fetch attempt
    }
  };
  useEffect(() => {
    fetchMyRestaurants();
  }, []);

  // Handle adding a time slot to the editingTimeSlots state
  const handleAddTimeSlot = () => {
    if (currentTimeSlot && !editingTimeSlots.includes(currentTimeSlot)) {
      setEditingTimeSlots([...editingTimeSlots, currentTimeSlot]);
      setCurrentTimeSlot(""); // Clear the input field
    }
  };

  // Handle removing a time slot from the editingTimeSlots state
  const handleRemoveTimeSlot = (slotToRemove) => {
    setEditingTimeSlots(
      editingTimeSlots.filter((slot) => slot !== slotToRemove)
    );
  };

  // Handle adding a table to the editingTables state
  const handleAddTable = () => {
  const size = parseInt(currentTableSize, 10);
  const count = parseInt(currentTableCount, 10);

  const allowedSizes = [2, 4, 6, 8, 10];

  if (!allowedSizes.includes(size)) {
    alert("Table size must be one of: 2, 4, 6, 8, 10.");
    return;
  }

  if (isNaN(count) || count <= 0) {
    alert("Table count must be a positive number.");
    return;
  }

  const newTable = { size, count };

  // Check for duplicate table size
  const existingIndex = editingTables.findIndex((table) => table.size === size);

  if (existingIndex > -1) {
    // Merge counts if size already exists
    const updatedTables = [...editingTables];
    updatedTables[existingIndex].count += count;
    setEditingTables(updatedTables);
  } else {
    setEditingTables([...editingTables, newTable]);
  }

  setCurrentTableSize("");
  setCurrentTableCount("");
};

  // Handle removing a table from the editingTables state
  const handleRemoveTable = (tableToRemove) => {
    setEditingTables(
      editingTables.filter(
        (table) =>
          table.size !== tableToRemove.size ||
          table.count !== tableToRemove.count
      )
    );
  };

  // Handle form submission for creating or updating
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear any previous errors
    setError(null);

    if (editingRestaurant && isEditingMyRestaurant) {
      // Handle update API call here
      console.log("Attempting to update restaurant:", editingRestaurant.id);

      // Construct the payload for update based on the provided sample structure
      const updatePayload = {
        id: editingRestaurant.id, // Include the ID in the payload
        name: name,
        address: address,
        contactInfo: phone, // Mapping phone to contactInfo
        hours: hours,
        availableTimes: editingTimeSlots, // Mapping editingTimeSlots to availableTimes
        tableSizes: editingTables, // Mapping editingTables to tableSizes (assuming structure matches {size, count})
        description: description,
        main_image: mainImageUrl,
        images: additionalImageUrls
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url), // Split and clean additional URLs
      };

      try {
        const response = await fetch(`api/restaurants/${resId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Add Content-Type header
          },
          body: JSON.stringify(updatePayload),
        });
        if (!response.ok) {
          // Attempt to parse error response if available
          const errorBody = await response
            .json()
            .catch(() => ({ message: "Unknown error" }));
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${
              errorBody.message || response.statusText
            }`
          );
        }
        // Add success message
        alert("Restaurant updated successfully!");
        // Refresh the restaurant list
        fetchMyRestaurants();
      } catch (error) {
        console.error("Error updating restaurant:", error);
        setError(`Failed to update restaurant: ${error.message}`);
      }
    } else {
      // Extract location from address (typically the city/region)
      const locationFromAddress = address.includes(",")
        ? address.split(",").pop().trim()
        : address; // Use full address as location if no comma found
      // Validate required fields
      // Validate ONLY the required fields that the backend checks
      if (
        !name ||
        !address ||
        !locationFromAddress ||
        !cuisine ||
        !costRating ||    // Add this field check
        !editingTimeSlots.length ||
        !editingTables.length
      ) {
        setError(
          "Please fill in all required fields: name, address, location, cuisine, cost rating, at least one time slot, and at least one table."
        );
        return;
      }

      // All other fields are optional and can be empty
      const createPayload = {
        name,
        address,
        contactInfo: phone || "", // Maps to phone number
        hours: hours || "", 
        cuisineType: cuisine, // The same value gets sent to both fields
        costRating, // Must be "CHEAP", "REGULAR", or "EXPENSIVE"
        description: description || "",
        main_image: mainImageUrl || "",
        images: additionalImageUrls
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url),
        price: costRating,
        tableDistribution: editingTables,
        availableTimes: editingTimeSlots,
        location: location || locationFromAddress, // Use explicit location field if provided
        cuisine, // The same value is used for both cuisineType and cuisine
        googlePlaceId:
          googlePlaceId ||
          `${name.toLowerCase().replace(/\s+/g, "-")}-${Math.random()
            .toString(36)
            .slice(2)}`,
        // The API will automatically create these as empty arrays:
        // reviews: [],
        // bookings: [],
        // tables: []
      };

      // Log the payload for debugging
      console.log("Payload being sent:", JSON.stringify(createPayload, null, 2));

      try {
        // Replace with your actual API endpoint for adding a new restaurant
        const response = await fetch("api/restaurants", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Add Content-Type header
          },
          body: JSON.stringify(createPayload),
        });
        if (!response.ok) {
          // Attempt to parse error response if available
          const errorBody = await response
            .json()
            .catch(() => ({ message: "Unknown error" }));
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${
              errorBody.message || response.statusText
            }`
          );
        }
        // Add success message
        alert("Restaurant added successfully!");
        // Refresh the restaurant list
        fetchMyRestaurants();
      } catch (error) {
        console.error("Error adding new restaurant:", error);
        setError(`Failed to add restaurant: ${error.message}`);
      }
    }

    // Clear the form and states after successful submission (or attempt)
    setName("");
    setAddress("");
    setPhone("");
    setLocation("");
    setCuisine("");
    setMainImageUrl("");
    setHours("");
    setDescription("");
    setCostRating("");
    setAdditionalImageUrls("");
    setGooglePlaceId("");
    setCurrentTimeSlot("");
    setEditingTimeSlots([]);
    setCurrentTableSize("");
    setCurrentTableCount("");
    setEditingTables([]);
    setEditingRestaurant(null);
    setIsEditingMyRestaurant(false);
  };

  // Handle editing a restaurant from the "My Restaurants" list
  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setResId(restaurant.id);
    setIsEditingMyRestaurant(true); // Indicate we are editing a "My Restaurant"
    setShowFormSection(true);
    setShowViewSection(false);
    // Populate form fields with existing data from the API structure
    setName(restaurant.name || "");
    // Populate other form fields based on how your API data maps to the form
    // This mapping is crucial and depends on your API's response structure.
    // Example mapping based on the provided API data structure and form fields:
    setAddress(restaurant.address || ""); // Assuming API provides address
    setPhone(restaurant.contactInfo || ""); // Mapping API contactInfo to form phone
    setLocation(restaurant.location || "");
    setCuisine(restaurant.cuisine || ""); // Map API 'cuisine' to form 'cuisine'
    setMainImageUrl(restaurant.main_image || ""); // Map API main_image to form
    setHours(restaurant.hours || ""); // Assuming API provides hours
    setDescription(restaurant.description || ""); // Assuming API provides description
    setCostRating(restaurant.costRating || ""); // Map API costRating to form
    setAdditionalImageUrls(restaurant.images?.join(", ") || ""); // Assuming API provides 'images' array
    setGooglePlaceId(restaurant.googlePlaceId || ""); // Map API googlePlaceId to form
    setEditingTimeSlots(restaurant.availableTimes || []); // Map API availableTimes to form state
    // Note: The provided API data does NOT have 'cuisineDishes' or 'tables' arrays with size/count.
    // If your API does return this data, you would populate editingCuisineDishes and editingTables here.
    // setEditingCuisineDishes(restaurant.cuisineDishes || []);
    // setEditingTables(restaurant.tables || []);
  };

  // Handle clearing the form when not editing
  const handleCancelEdit = () => {
    setEditingRestaurant(null);
    setIsEditingMyRestaurant(false);
    setName("");
    setAddress("");
    setPhone("");
    setLocation("");
    setCuisine("");
    setMainImageUrl("");
    setHours("");
    setDescription("");
    setCostRating("");
    setAdditionalImageUrls("");
    setGooglePlaceId("");
    setCurrentTimeSlot("");
    setEditingTimeSlots([]);
    // setCurrentCuisineDish(''); // Keep cuisine dish state clear
    // setEditingCuisineDishes([]); // Keep cuisine dishes clear
    setCurrentTableSize("");
    setCurrentTableCount("");
    setEditingTables([]);
  };

  // Helper function to format time slots (assuming "HH:MM" format)
  const formatTimeSlots = (times) => {
    if (!times || times.length === 0) return "Not available";
    return times
      .map((time) => {
        const [hour, minute] = time.split(":");
        const hourInt = parseInt(hour, 10);
        const ampm = hourInt >= 12 ? "PM" : "AM";
        const formattedHour = hourInt % 12 || 12; // Convert 0 to 12 for 12 AM/PM
        return `${formattedHour}:${minute} ${ampm}`;
      })
      .join(", ");
  };

  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, md: 8 } }}
      >
        <Paper
          elevation={3}
          sx={{ p: { xs: 4, md: 6 }, borderRadius: "8px", textAlign: "center" }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading your restaurants...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, md: 8 } }}
      >
        <Paper elevation={3} sx={{ p: { xs: 4, md: 6 }, borderRadius: "8px" }}>
          <Alert severity="error">{error}</Alert>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container
      maxWidth="md"
      sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, md: 8 } }}
    >
    <Paper elevation={3} sx={{ p: { xs: 4, md: 6 }, borderRadius: '8px' }}>
      {/* Top Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
        <Button
          variant={showFormSection ? 'contained' : 'outlined'}
          onClick={toggleFormSection}
        >
          Add / Update Restaurant
        </Button>
        <Button
          variant={showViewSection ? 'contained' : 'outlined'}
          onClick={toggleViewSection}
        >
          View Restaurants
        </Button>
      </Box>

      {/* --- SECTION 1 --- */}
      <Box sx={{ display: showFormSection ? 'block' : 'none' }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            mb: { xs: 4, md: 6 },
            fontSize: { xs: "1.5rem", md: "2.125rem" },
          }}
        >
          Restaurant Manager
        </Typography>

        {/* Restaurant Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ "& > :not(style)": { m: 1 }, mb: { xs: 6, md: 8 } }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, mt: 2, color: "primary.main", fontWeight: 500 }}
          >
            Required Information *
          </Typography>

          <Grid container spacing={2}>
            {/* Restaurant Name */}
            <Grid item xs={12}>
              <TextField
                label="Restaurant Name"
                variant="outlined"
                fullWidth
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="small"
                //error={!name}
                helperText={!name ? "Required" : ""}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                label="Address "
                variant="outlined"
                fullWidth
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                size="small"
                helperText={!address ? "Required" : ""}
              />
            </Grid>

            {/* Cuisine Type */}
            <Grid item xs={12}>
              <TextField
                label="Cuisine Type"
                variant="outlined"
                fullWidth
                required
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                size="small"
                //error={!cuisine}
                helperText={!cuisine ? "Required" : ""}
              />
            </Grid>

            {/* Cost Rating */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Cost Rating" 
                variant="outlined"
                sx={{ width: { xs: "100%", md: "220px" } }}
                required
                value={costRating}
                onChange={(e) => setCostRating(e.target.value)}
                size="small"
                helperText={!costRating ? "Required" : ""}
              >
                <MenuItem value="CHEAP">Cheap</MenuItem>
                <MenuItem value="REGULAR">Regular</MenuItem>
                <MenuItem value="EXPENSIVE">Expensive</MenuItem>
              </TextField>
            </Grid>

          
          </Grid>

          {/* Available Times - Required */}
          <Typography
            variant="subtitle1"
            sx={{ mt: 3, mb: 1, fontWeight: 500 }}
          >
            Available Times *
          </Typography>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
              <TextField
              //label="Available Time"
              type="time"
              value={currentTimeSlot}
              onChange={(e) => setCurrentTimeSlot(e.target.value)}
              fullWidth
              size="small"
              placeholder="12:00"
              sx={{ width: { xs: "100%", md: "77%" } }}
            />
            <Button
              variant="contained"
              onClick={handleAddTimeSlot}
              size="small"
              startIcon={<AddIcon />}
            >
              Add Time
            </Button>
          </Box>

          {editingTimeSlots.length > 0 && (
            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1, mb: 3 }}
            >
              {editingTimeSlots.map((slot, index) => (
                <Chip
                  key={`time-slot-${index}`}
                  label={slot}
                  onDelete={() => handleRemoveTimeSlot(slot)}
                  size="small"
                  color="primary"
                />
              ))}
            </Box>
          )}

          {/* Table Distribution - Required */}
          <Typography
            variant="subtitle1"
            sx={{ mt: 3, mb: 1, fontWeight: 500 }}
          >
            Table Distribution *
          </Typography>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
              <TextField
              select
              label="Table Size"
              value={currentTableSize}
              onChange={(e) => setCurrentTableSize(e.target.value)}
              size="small"
              sx={{ width: { xs: "100%", md: "35%" } }}
            >
              {[2, 4, 6, 8, 10].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Table Count"
              variant="outlined"
              size="small"
              type="number"
              inputProps={{ min: 1}}
              value={currentTableCount}
              onChange={(e) => setCurrentTableCount(e.target.value)}
              sx={{ width: { xs: "100%", md: "auto" } }}
            />
            <Button
              variant="contained"
              onClick={handleAddTable}
              size="small"
              startIcon={<AddIcon />}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              Add Table Type
            </Button>
          </Box>

          {editingTables.length > 0 && (
            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1, mb: 3 }}
            >
              {editingTables.map((table, index) => (
                <Chip
                  key={`table-${index}`}
                  label={`Size: ${table.size}, Count: ${table.count}`}
                  onDelete={() => handleRemoveTable(table)}
                  size="small"
                  color="secondary"
                />
              ))}
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>
            Optional Information
          </Typography>

          <Grid container spacing={2}>
            {/* Contact Information */}
            <Grid item xs={12} md={6}>
            <TextField
              label="Phone Number"
              placeholder="+1 408-555-1234"
              variant="outlined"
              fullWidth
              value={phone}
              onChange={(e) => {
                const input = e.target.value;
                const filtered = input.replace(/[^0-9+\-\s]/g, '');
                setPhone(filtered);
              }}
              size="small"
              type="tel"
              inputProps={{
                maxLength: 10, // Allow for "+1 408-555-1234" (including symbols & spaces)
                inputMode: "tel"
              }}
            />
          </Grid>
            
            
            {/* Location */}
            <Grid item xs={12}>
              <TextField
                label="Location (City/Area)"
                variant="outlined"
                fullWidth
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                size="small"
                helperText="City or area where restaurant is located (will be derived from address if left empty)"
                sx={{ width: { xs: "100%", md: "95%" } }}
              />
            </Grid>

            
            {/* Images */}
            <Grid item xs={12}>
              <TextField
                label="Main Image URL"
                variant="outlined"
                fullWidth
                value={mainImageUrl}
                onChange={(e) => setMainImageUrl(e.target.value)}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Additional Image URLs"
                variant="outlined"
                fullWidth
                value={additionalImageUrls}
                onChange={(e) => setAdditionalImageUrls(e.target.value)}
                size="small"
              />
            </Grid>
            
            {/* Additional Details */}
            <Grid item xs={12}>
              <TextField
                label="Hours"
                variant="outlined"
                fullWidth
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Google Place ID"
                variant="outlined"
                fullWidth
                value={googlePlaceId}
                onChange={(e) => setGooglePlaceId(e.target.value)}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ width: { xs: "100%", md: "225%" } }}
              />
            </Grid>
            
            
          </Grid>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "flex-start",
              gap: { xs: 2, md: 2 },
              mt: 3,
              "& .MuiButton-root": {
                borderRadius: "20px",
                width: { xs: "100%", md: "50%" },
              },
            }}
          >
            {(
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancelEdit}
                size="small"
              >
              {editingRestaurant ? "Cancel Edit" : "Clear Form"}
              </Button>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              size="large"
              sx={{ 
                borderRadius: "20px",
                px: 4,
                py: 1
              }}
            >
              {editingRestaurant ? "Update Restaurant" : "Add Restaurant"}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* --- SECTION 2 --- */}
      <Box sx={{ display: showViewSection ? 'block' : 'none' }}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ mb: 4, fontSize: { xs: "1.25rem", md: "1.5rem" } }}
        >
          My Restaurants ({myRestaurants.length})
        </Typography>
        {myRestaurants.length === 0 ? (
          <Typography
            variant="body1"
            align="center"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.875rem", md: "1rem" },
            }}
          >
            You have no restaurants listed yet.
          </Typography>
        ) : (
          <List sx={{ border: "1px solid #ccc", borderRadius: "8px" }}>
            {myRestaurants.map((restaurant) => (
              <ListItem
                key={restaurant.id} // Use API provided 'id' as key
                secondaryAction={
                  <Box sx={{ display: "flex", gap: { xs: 1, md: 2 } }}>
                    {/* Edit button for my restaurants */}
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleEdit(restaurant)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                }
                sx={{
                  borderBottom: "1px solid #eee",
                  "&:last-child": { borderBottom: "none" },
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "flex-start", md: "center" },
                }}
              >
                {/* Display data from the API structure */}
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
                      {/* Display relevant info from the API data */}
                      Status: {restaurant.status} | Cuisine:{" "}
                      {restaurant.cuisine} | Price: {restaurant.price}
                      {restaurant.availableTimes &&
                        restaurant.availableTimes.length > 0 && (
                          <>
                            {" "}
                            | Available Times:{" "}
                            {formatTimeSlots(restaurant.availableTimes)}
                          </>
                      )}
                      {/* You can add more details from the API data here */}
                      {/* | Bookings: {restaurant.bookingsCount} | Rating: {restaurant.avgRating} */}
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
                {/* Display main image as a small thumbnail if available */}
                {restaurant.main_image && (
                  <Box
                    component="img"
                    src={restaurant.main_image}
                    alt={`Image of ${restaurant.name}`}
                    sx={{
                      width: 50, // Thumbnail width
                      height: 50, // Thumbnail height
                      objectFit: "cover",
                      borderRadius: "4px",
                      ml: { md: 2 }, // Margin left on desktop
                      mt: { xs: 1, md: 0 }, // Margin top on mobile
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper> 
    </Container>
  );
};

export default RestaurantManager;