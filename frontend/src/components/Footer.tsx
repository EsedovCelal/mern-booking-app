import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="bg-blue-800 py-10 px-4 md:px-0">
      <div className="container mx-auto flex justify-between items-center">
        <span className="md:block hidden text-3xl text-white font-bold tracking-tight">
          <Link to="/">StayNest.com</Link>
        </span>
        <span className="md:hidden text-3xl text-white font-bold tracking-tight">
          <Link to="/">SN</Link>
        </span>
        <span className="text-white font-bold tracking-tight flex gap-4">
          <Link to="/privacy-policy" className="cursor-pointer">
            Privacy Policy
          </Link>
          <Link to="/terms-of-service" className="cursor-pointer">
            Terms of Service
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Footer;
