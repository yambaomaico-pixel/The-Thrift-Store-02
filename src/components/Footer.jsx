import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaGithub, FaBoxOpen } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: 'var(--color-surface)', 
      borderTop: '1px solid var(--color-border)', 
      padding: 'var(--spacing-12) 0', 
      marginTop: 'auto' 
    }}>
      <div className="container flex flex-col md-flex-row justify-between" style={{ gap: 'var(--spacing-12)' }}>
        {/* Brand Column */}
        <div className="flex-1" style={{ maxWidth: '400px' }}>
          <div className="flex items-center gap-2 font-bold" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>
            <FaBoxOpen style={{ color: 'var(--color-accent)' }} size={24} />
            <span>The Thrift Store</span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: '1.6', marginBottom: 'var(--spacing-6)' }}>
            A curated collection of pre-loved items looking for a new home. Sustainable, affordable, and stylish.
          </p>
          <div className="flex items-center gap-4" style={{ color: 'var(--color-text-secondary)' }}>
            <a href="#" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--color-accent)'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}><FaFacebook size={20} /></a>
            <a href="#" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--color-accent)'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path></svg>
            </a>
            <a href="#" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--color-accent)'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}><FaInstagram size={20} /></a>
            <a href="#" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--color-accent)'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}><FaGithub size={20} /></a>
          </div>
        </div>

        {/* Security & Privacy Column */}
        <div className="flex-1" style={{ maxWidth: '300px' }}>
          <h3 className="font-bold" style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--spacing-4)' }}>SECURITY & PRIVACY</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: '1.6' }}>
            This application requires secure login via Google Auth. All uploaded content is scanned and moderated in compliance with firestore security controls.
          </p>
        </div>

        {/* Navigation Column */}
        <div className="flex-1" style={{ textAlign: 'right' }}>
          <h3 className="font-bold" style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--spacing-4)' }}>NAVIGATION</h3>
          <ul className="flex flex-col gap-2" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/login">Login / Register</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container flex flex-col md-flex-row justify-between items-center" style={{ 
        marginTop: 'var(--spacing-12)', 
        paddingTop: 'var(--spacing-6)', 
        borderTop: '1px solid var(--color-border)',
        gap: 'var(--spacing-4)'
      }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
          © 2026 The Thrift Store. All rights reserved.
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
          Designed for visual & functional premium quality.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
