import { Link } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import SignOutButton from "./SignOutButton";
import { FaHotel } from "react-icons/fa";
import { MdHotel } from "react-icons/md";

const Header = () => {
  const { isLoggedIn } = useAppContext();
  return (
    <div className="bg-blue-800 py-6 px-4 md:px-0">
      <div className="container mx-auto flex justify-between">
        <span className="md:block hidden text-3xl text-white font-bold tracking-tight">
          <Link to="/">StayNest.com</Link>
        </span>
        <span className="md:hidden text-4xl text-white font-bold tracking-tight">
          <Link to="/">SN</Link>
        </span>
        <span className="flex space-x-2">
          {isLoggedIn ? (
            <div className="flex gap-5">
              <Link
                className="hidden lg:flex items-center text-white px-3 font-bold hover: bg-blue-600"
                to="/my-bookings"
              >
                My Bookings
              </Link>
              <Link className="lg:hidden" to="/my-bookings">
                <FaHotel color="white" size={40} />
              </Link>
              <Link
                className="lg:flex hidden items-center text-white px-3 font-bold hover: bg-blue-600"
                to="/my-hotels"
              >
                My Hotels
              </Link>
              <Link className="lg:hidden" to="/my-hotels">
                <MdHotel color="white" size={40} />
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <Link
              to="/sign-in"
              className="flex bg-white items-center text-blue-600 px-3 font-bold hover:bg-gray-100 hover:text-blue-500"
            >
              Sign In
            </Link>
          )}
        </span>
      </div>
    </div>
  );
};

export default Header;
