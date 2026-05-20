import React from "react";
import { Star } from "lucide-react";

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export default function RestaurantCard({ restaurant, onClick }) {
  const {
    main_image,
    name,
    cuisine,
    price,
    avgRating = 0,
    reviewsCount = 0,
    availableTimes = [],
    googlePlaceId,
    bookingsCount // New prop for booking count
  } = restaurant;

  const priceToDollars = (p) => {
    if (!p) return "$$";
    return { CHEAP: "$", REGULAR: "$$", EXPENSIVE: "$$$" }[p] || "$$";
  };

  const fetchGooglePlaceDetails = async (placeId) => {
    try {
      const res = await fetch(`/api/google/reviews?placeId=${placeId}`);
      const data = await res.json();
  
      if (data.status !== "OK") {
        console.warn("Google API Error:", data.status);
        return null;
      }
  
      const result = data.result;
      return {
        average_rating: result.rating,
        total_reviews: result.user_ratings_total,
        top_5_reviews:
          result.reviews?.map((r) => ({
            author_name: r.author_name,
            rating: r.rating,
            text: r.text,
            relative_time: r.relative_time_description,
          })) || [],
      };
    } catch (err) {
      console.error("❌ Failed to fetch Google reviews:", err);
      return null;
    }
  };
  

  const handleClick = async () => {
    let googleReviews = null;
    if (googlePlaceId) {
      googleReviews = await fetchGooglePlaceDetails(googlePlaceId);
    }

    onClick?.({ ...restaurant, googleReviews });
  };

  return (
    <div
      className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden flex flex-col"
      onClick={handleClick}
    >
      <img
        src={main_image || "/placeholder.jpg"}
        alt={name}
        className="h-44 w-full object-cover"
      />

      <div className="p-4 flex flex-col gap-1 flex-1">
        <h3 className="text-lg font-semibold truncate">{name}</h3>
        <p className="text-sm text-gray-500">
          {cuisine} • {priceToDollars(price)}
        </p>
        <p className="text-sm text-gray-500">
          {bookingsCount} times booked today
        </p>

        

        <div className="mt-auto pt-2 flex flex-wrap gap-2">
          {availableTimes.slice(0, 4).map((t) => (
            <button
              key={t}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                localStorage.setItem("selectedTime", t);
                handleClick(); 
              }}
              className="px-2 py-1 border border-indigo-500 text-indigo-600 rounded text-xs hover:bg-indigo-50 transition"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
