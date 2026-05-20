import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminManager from "./pages/Admin-Manager";
import PendingApprovalList from './components/PendingApprovals';
import ManageAllRestaurants from "./pages/ManageAllRestaurants";
import MyBookings from "./pages/MyBookings";

import store from "./store";


const App = () => {
  return (
    <Provider store={store}>
  <Router>
    <div className="flex flex-col min-h-screen">

      <NavBar />
      <div className="flex-1">

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<PendingApprovalList />} />
          <Route path="/manager" element={<AdminManager />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/manage-restaurants" element={<ManageAllRestaurants />} />
          <Route path="/mybookings" element={<MyBookings />} />
        </Routes>
      </div>
      <Footer />
    </div>
  </Router>
</Provider>

  );
};

export default App;
