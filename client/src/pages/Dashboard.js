import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const isTokenExpired = () => {
  const token = sessionStorage.getItem("JWT");
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (err) {
    return true;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isTokenExpired()) {
      sessionStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-md z-10">
        <h1 className="text-2xl font-bold text-indigo-800">Admin Analytics Dashboard</h1>
        <p className="text-gray-600 text-sm">Reservation analytics for the past month</p>
      </div>

      {/* Responsive Iframe */}
      <div className="flex-grow relative">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          style={{
            border: 'none',
            borderRadius: '0px',
          }}
          src="https://charts.mongodb.com/charts-project-0-wkfxbfg/embed/dashboards?id=680aad96-c577-4e6c-83a8-867145e56592&theme=light&autoRefresh=true&maxDataAge=3600&showTitleAndDesc=false&scalingWidth=fit&scalingHeight=fit"
          title="Reservation Analytics"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default Dashboard;
