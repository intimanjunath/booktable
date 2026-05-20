// client/src/utils/maps.js
export async function openInGoogleMaps(address) {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      alert("Map service not configured.");
      return;
    }
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", address);
    url.searchParams.set("key", apiKey);
  
    const res = await fetch(url);
    const { results } = await res.json();
    if (!results || !results.length) {
      alert("Couldn’t locate that address.");
      return;
    }
    const { lat, lng } = results[0].geometry.location;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  }