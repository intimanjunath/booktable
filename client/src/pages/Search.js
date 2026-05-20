import React, { useState } from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
// import CardActionArea from "@mui/material/CardActionArea";
// import CardActions from "@mui/material/CardActions";
// import RestaurantCard from "../components/RestaurantCard";
import { useMediaQuery, useTheme } from "@mui/material";
import Description from "../components/Description";
import RestaurantCard from "../components/RestaurantCard";

// ⏲️ Time options generator (30-min interval, 11 AM → 10 PM)
const TIME_OPTIONS = Array.from({ length: 24 })
  .map((_, i) => 11 * 60 + i * 30) // minutes after 11:00
  .filter((m) => m <= 22 * 60)
  .map((mins) => {
    const h24 = String(Math.floor(mins / 60)).padStart(2, "0");
    const mm = String(mins % 60).padStart(2, "0");
    const h12 = ((Math.floor(mins / 60) + 11) % 12) + 1;
    const period = mins / 60 >= 12 ? "PM" : "AM";
    return {
      value: `${h24}:${mm}`,
      label: `${h12}:${mm} ${period}`,
    };
  });

const Cards = ({
  results,
  handleView,
  handleSelectedCard,
  handleSelectedCardData,
}) => {
  const {
    main_image,
    name,
    price,
    availableTimes = [],
  } = results;

  const cardClickHandler = (name, results) => {
    handleView();
    handleSelectedCard(name);
    handleSelectedCardData(results);
  };
  // const GOOGLE_API_KEY = 'AIzaSyD6twIZ77sy_q-RhXZ7nsDVKzgoba4hRL8';
  // const handleReviews = () => {
  //   fetch('https://maps.googleapis.com/maps/api/place/details/json').then()
  // }
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card
      sx={{
        height: "250px",
        width: `${isMobile ? "150px" : "220px"}`,
        backgroundColor: "white",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          boxShadow: 6,
        },
        "&:active": {
          transform: "scale(0.95)",
        },
      }}
      onClick={() => cardClickHandler(name, results)}
    >
      <CardMedia
        component="img"
        alt={name}
        image={main_image}
        sx={{ height: "120px", objectFit: "cover" }}
      />
      <CardContent>
        <Typography gutterBottom variant="body1" fontWeight={'bold'} component="div">
          {name}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {price}
        </Typography>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 0.6,
            }}
          >
            {availableTimes.map((time, index) => (
              <div
                key={index}
                style={{
                  width: "35px",
                  border: "1px solid #1976D2",
                  borderRadius: "5px",
                  height: "20px",
                  textAlign: "center",
                  marginTop: "5px",
                  color: "#1976D2",
                  fontSize: `${isMobile ? "9px" : "12px"}`
                }}
              >
                {time}
              </div>
            ))}
          </Box>
        </Grid>
      </CardContent>
      {/* <CardActions>
      <Button size="small">Share</Button>
      <Button size="small">Learn More</Button>
    </CardActions> */}
    </Card>
  );
};

export default function Search() {
  // 🔧 Form state
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [view, setView] = useState("cards");
  const [selectedCard, setSelectedCard] = useState("");
  const [selectedCardData, setSelectedCardData] = useState({});
  console.log(selectedCard);

  // 📦  Result state
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📤 Submit handler
  const handleSearch = async (e) => {
    setView('cards')
    e.preventDefault();
    // guard
    if (!time || !guests) return alert("Select both time & guests");

    const params = new URLSearchParams({
      time,
      people: guests,
      location: location.trim(),
    }).toString();

    try {
      setLoading(true);

      const url = `/api/restaurants/search?${params}`;
      console.log("➡️  Fetching:", url);

      const res = await fetch(url);
      console.log("↩️  Status:", res.status, res.statusText);

      if (!res.ok) throw new Error(`API ${res.status}`);

      const data = await res.json();
      console.log("✅ Data:", data);
      setResults(data);
    } catch (err) {
      console.error("❌ search error", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  const handleSelectedCard = (name) => setSelectedCard(name);
  const handleSelectedCardData = (data) => setSelectedCardData(data);
  const handleBack = () => setView("cards");
  const handleView = () => setView("description");
  console.log(view);
  // 📆 today (disable past dates)
  const today = new Date().toISOString().split("T")[0];
  console.log(results);
  return (
    <div className="min-h-[calc(100vh-120px)] bg-white px-4 py-8">
      {/* ─── Search Bar Card ────────────────────────────── */}
      <form
        onSubmit={handleSearch}
        className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 rounded-lg bg-white p-4 shadow"
      >
        {/* Location */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Location</label>
          <div className="relative">
            <MapPin className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="City Optional"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-10 w-48 rounded border border-gray-300 pl-8 text-sm focus:border-blue-500 focus:ring-0 sm:w-56"
            />
          </div>
        </div>

        {/* Date */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Date</label>
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                localStorage.setItem("selectedDate", e.target.value); // save globally
              }}
              min={today}
              className="h-10 w-44 rounded border border-gray-300 pl-8 text-sm focus:border-blue-500 focus:ring-0"
              required
            />
          </div>
        </div>

        {/* Time */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Time</label>
          <div className="relative">
            <Clock className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-10 w-36 appearance-none rounded border border-gray-300 bg-white pl-8 pr-4 text-sm focus:border-blue-500 focus:ring-0"
              required
            >
              <option value="" disabled>
                Select Time
              </option>
              {TIME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Guests */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Guests</label>
          <div className="relative">
            <Users className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={guests}
              onChange={(e) => {
                const selectedGuests = Number(e.target.value);
                setGuests(selectedGuests);
                localStorage.setItem("selectedGuests", selectedGuests); // ✅ store globally
              }}
              className="h-10 w-32 appearance-none rounded border border-gray-300 bg-white pl-8 pr-4 text-sm focus:border-blue-500 focus:ring-0"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "person" : "people"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="h-10 rounded bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? "Searching…" : "Let's Go"}
        </button>
      </form>

      {/* ─── Results Section ─────────────────────────────── */}
      <section className="mx-auto mt-10 max-w-6xl">
        {results.length === 0 ? (
          <p className="text-center text-gray-600">
            {loading
              ? "Fetching restaurants…"
              : "No results found. Try another time/location."}
          </p>
        ) : (
          <>
            <h2 className="mb-4 text-lg font-semibold">
              Available at {TIME_OPTIONS.find((t) => t.value === time)?.label}
            </h2>

            {view === "cards" ? (
              <Grid container spacing={2} justifyContent="center">
                {results.map((r) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={r.id}>
                    <RestaurantCard
                      restaurant={r}
                      onClick={(restaurantWithReviews) => {
                        handleView();
                        handleSelectedCard(restaurantWithReviews.name);
                        handleSelectedCardData(restaurantWithReviews);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Description
                selectedCardData={selectedCardData}
                handleBack={handleBack}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}
