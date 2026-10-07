import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaGithub, FaBoxOpen } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6 lg:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        {/* Brand Column */}
        <div className="flex-1 max-w-sm">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-800 mb-4">
            <FaBoxOpen className="text-blue-600" size={24} />
            <span>The Thrift Store</span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            A curated collection of pre-loved items looking for a new home. Sustainable, affordable, and stylish.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <a href="#" className="hover:text-blue-600 transition-colors"><FaFacebook size={20} /></a>
            <a href="#" className="hover:text-slate-900 transition-colors">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path></svg>
            </a>
            <a href="#" className="hover:text-pink-600 transition-colors"><FaInstagram size={20} /></a>
            <a href="#" className="hover:text-slate-900 transition-colors"><FaGithub size={20} /></a>
          </div>
        </div>

        {/* Navigation Column */}
        <div className="flex-1">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-4">NAVIGATION</h3>
          <ul className="flex flex-col gap-3 text-sm text-slate-500">
            <li><Link to="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
            <li><Link to="/shop" className="hover:text-blue-600 transition-colors">Shop</Link></li>
            <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
            <li><Link to="/login" className="hover:text-blue-600 transition-colors">Login / Register</Link></li>
          </ul>
        </div>

        {/* Security & Privacy Column */}
        <div className="flex-1 max-w-xs">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-4">SECURITY & PRIVACY</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            This application requires secure login via Google Auth. All uploaded content is scanned and moderated in compliance with firestore security controls.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-400">
          © 2026 The Thrift Store. All rights reserved.
        </p>
        <p className="text-xs text-slate-400">
          Designed for visual & functional premium quality.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
