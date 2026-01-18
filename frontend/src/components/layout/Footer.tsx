import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Logo" className="h-24" />
            </Link>
            <p className="text-sm opacity-70">
              The trusted auction platform for collectors and enthusiasts worldwide.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/how-it-works" className="hover:opacity-100 transition-opacity">How it works</Link></li>
              <li><Link to="/auctions" className="hover:opacity-100 transition-opacity">Browse auctions</Link></li>
              <li><Link to="/sell" className="hover:opacity-100 transition-opacity">Sell an item</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/category/art" className="hover:opacity-100 transition-opacity">Art</Link></li>
              <li><Link to="/category/watches" className="hover:opacity-100 transition-opacity">Watches</Link></li>
              <li><Link to="/category/coins-bars" className="hover:opacity-100 transition-opacity">Coins & Bars</Link></li>
              <li><Link to="/category/ancient-vehicles" className="hover:opacity-100 transition-opacity">Vehicles</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/contact" className="hover:opacity-100 transition-opacity">Contact us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8 text-center text-sm opacity-50">
          ඈvarai
        </div>
      </div>
    </footer>
  );
};

export default Footer;
