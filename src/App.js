import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Explore from "./pages/Explore/Explore";
import ForgotPassword from "./pages/ForgotPassword";
import Offers from "./pages/Category/Offers";
import Category from "./pages/Category/Category";
import Profile from "./pages/Profile/Profile";
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignIn/SignUp";
import Navbar from "./components/Navbar/Navbar";
import CreateListing from "./pages/CreateListing/CreateListing";
import EditListing from "./pages/CreateListing/EditListing";
import Listing from "./pages/Listing/Listing";
import PrivateRoute from "./components/PrivateRoute";
import ContactPage from "./pages/Contact/ContactPage";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Explore />}></Route>
          <Route path="/offers" element={<Offers />}></Route>
          <Route path="/category/:categoryName" element={<Category />}></Route>
          <Route
            path="/category/:categoryName/:id"
            element={<Listing />}
          ></Route>
          <Route path="/profile" element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/sign-in" element={<SignIn />}></Route>
          <Route path="/sign-up" element={<SignUp />}></Route>
          <Route path="/create-listing" element={<CreateListing />}></Route>
          <Route
            path="/edit-listing/:listingId"
            element={<EditListing />}
          ></Route>
          <Route
            path="/forgot-password/:email"
            element={<ForgotPassword />}
          ></Route>
          <Route path="/forgot-password" element={<ForgotPassword />}></Route>
          <Route path="/contact/:landlordId" element={<ContactPage />}></Route>
        </Routes>
        <Navbar />
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
