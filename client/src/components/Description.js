// client/src/components/Description.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  MenuItem,
  Select,
  TextField,
  InputLabel,
  FormControl,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Divider,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Alert,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const Description = ({ selectedCardData = {}, handleBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tabIndex, setTabIndex] = useState(0);

  // State for booking form
  const [selectedGuests, setSelectedGuests] = useState(2);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState("19:00");
  const [specialRequests, setSpecialRequests] = useState("");

  // State for booking process
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Log the data structure to understand where restaurant ID is stored
  console.log("Restaurant data:", selectedCardData);

  // Pull coords and Place ID straight from the backend document
  const { lat, lng } = selectedCardData.locationCoords || {};
  const { googlePlaceId, name } = selectedCardData;

  const handleTabChange = (_, newValue) => {
    setTabIndex(newValue);
    const sectionIds = ["overview"];
    const section = document.getElementById(sectionIds[newValue]);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const handleBooking = async () => {
    setIsBooking(true);
    setBookingError(null);

    const token = sessionStorage.getItem("JWT");
    if (!token) {
      alert("Please login to book your table.");
      setIsBooking(false);
      return;
    }

    // Get restaurant ID
    const restaurantId = selectedCardData.id;

    // Construct booking_time as ISO string
    const bookingTime = new Date(`${selectedDate}T${selectedTime}`).toISOString();

    // Create payload with correct field names
    const payload = {
      restaurantId,
      number_of_people: selectedGuests,
      booking_time: bookingTime,
      special_requests: specialRequests || "",
    };

    console.log("Sending booking data:", payload);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response from server:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create booking");
      }

      // Show success state
      setBookingSuccess(true);
    } catch (error) {
      console.error("Booking error:", error);
      setBookingError(error.message || "Something went wrong with your booking");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Container
        maxWidth="md"
        sx={{
          backgroundColor: "#fff",
          px: { xs: 2, sm: 4 },
          py: 3,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ mb: 1 }}
          onClick={handleBack}
        >
          <ArrowBackIosNewIcon /> Go back
        </Button>

        {/* Banner Image */}
        <Box
          sx={{
            height: { xs: 150, sm: 200, md: 250 },
            backgroundImage: `url(${selectedCardData.main_image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 2,
            mb: 3,
          }}
        />

        {/* Restaurant Info */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {selectedCardData.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          4.3 (1861) · {selectedCardData.price} ·{" "}
          {selectedCardData.cuisine}
        </Typography>

        {/* Tabs */}
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          sx={{ my: 2 }}
        >
          <Tab label="Description" />
        </Tabs>

        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Overview */}
            <Box id="overview">
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {["Lively", "Charming", "Good for special occasions"].map(
                  (tag) => (
                    <Button key={tag} variant="outlined" size="small">
                      {tag}
                    </Button>
                  )
                )}
              </Box>
              <Typography variant="body1" paragraph>
                {selectedCardData.description}
              </Typography>
            </Box>
          </Grid>

          {/* Right Column - Reservation */}
          <Grid item xs={12} md={4}>
            {/* Google Reviews */}
            {Array.isArray(selectedCardData?.googleReviews?.top_5_reviews) &&
              selectedCardData.googleReviews.top_5_reviews.length > 0 && (
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Google Reviews
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      ⭐ {selectedCardData.googleReviews.average_rating} ·{" "}
                      {selectedCardData.googleReviews.total_reviews} reviews
                    </Typography>

                    <Box
                      sx={{
                        maxHeight: 250,
                        overflowY: "auto",
                        pr: 1,
                        border: "1px solid #eee",
                        borderRadius: 1,
                        p: 1,
                        backgroundColor: "#fafafa",
                      }}
                    >
                      {selectedCardData.googleReviews.top_5_reviews.map(
                        (review, i) => (
                          <Box key={i} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2">
                              {review.author_name} ({review.rating}★)
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {review.text}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="gray"
                              sx={{ fontStyle: "italic" }}
                            >
                              {review.relative_time}
                            </Typography>
                          </Box>
                        )
                      )}
                    </Box>
                  </CardContent>
                </Card>
              )}
            {/* Reservation Box */}
            <Card>
              <CardHeader
                title="Make a reservation"
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<LocationOnIcon />}
                    onClick={() => {
                      if (lat != null && lng != null && selectedCardData.name) {
                        const nameParam = encodeURIComponent(selectedCardData.name);
                        const llParam = `${lat},${lng}`;
                        window.open(
                          `https://maps.google.com/?q=${nameParam}&ll=${llParam}`,
                          "_blank"
                        );
                      } 
                      else {
                        alert("No map data available for this restaurant.");
                      }
                    }}
                  >
                    View on Map
                  </Button>
                }
              />

              <CardContent>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>People</InputLabel>
                  <Select 
                    value={selectedGuests} 
                    label="People" 
                    onChange={(e) => setSelectedGuests(e.target.value)}
                  >    
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num} people
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Special Requests"
                  multiline
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Allergies, accessibility needs, etc."
                  sx={{ mb: 2, mt: 2 }}
                />

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedCardData.availableTimes?.map((t, i) => (
                    <Button
                      key={i}
                      variant={selectedTime === t ? "contained" : "outlined"} // highlight selected
                      color="primary"
                      onClick={() => {
                        setSelectedTime(t);
                        localStorage.setItem("selectedTime", t);
                      }}
                    >
                      {t}
                    </Button>
                  ))}
                </Box>

                <Box sx={{ mt: 4, textAlign: "center" }}>
                  {bookingSuccess ? (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Booking confirmed! You will receive an email confirmation shortly.
                    </Alert>
                  ) : (
                    <>
                      {bookingError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {bookingError}
                        </Alert>
                      )}
                      <Button
                        variant="contained"
                        color="success"
                        size="large"
                        disabled={isBooking}
                        onClick={handleBooking}
                      >
                        {isBooking ? "Processing..." : "Book Your Table"}
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Description;