import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PromotionalCarousel = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  // Auto-advance interval: 3 seconds
  const autoRotateInterval = 3000;

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), where('isFeatured', '==', true));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.status !== 'sold');
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Handle Auto Rotation
  useEffect(() => {
    if (featuredProducts.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredProducts.length);
    }, autoRotateInterval);

    return () => clearInterval(timer);
  }, [featuredProducts.length, isPaused]);

  const handleNext = () => {
    if (featuredProducts.length <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredProducts.length);
  };

  const handlePrev = () => {
    if (featuredProducts.length <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + featuredProducts.length) % featuredProducts.length);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swipe left -> Next
      handleNext();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      // Swipe right -> Prev
      handlePrev();
    }
    // Reset values
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (loading) {
    return <div className="carousel-loading">Loading featured products...</div>;
  }

  // Fallback if no featured products exist
  if (featuredProducts.length === 0) {
    return (
      <section style={{ backgroundColor: 'var(--color-accent)', color: 'white', padding: 'var(--spacing-16) 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-4)' }}>Discover Unique Sustainable Fashion</h1>
          <p style={{ fontSize: 'var(--font-size-lg)', opacity: 0.9, marginBottom: 'var(--spacing-8)' }}>Shop pre-loved styles and reduce your carbon footprint.</p>
          <Link to="/shop" className="btn btn-outline" style={{ display: 'inline-block', color: 'white', borderColor: 'white' }}>Shop Now</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="promo-carousel-container" 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Wrapper for smooth transitions */}
      <div className="promo-carousel-inner" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {featuredProducts.map((product) => {
          const pOriginalPrice = product.price || 0;
          const pDiscount = product.discountPercentage || 0;
          const pSalePrice = pOriginalPrice - (pOriginalPrice * pDiscount / 100);

          return (
            <div className="promo-slide" key={product.id}>
              <div className="promo-slide-content">
                <div className="promo-image-container">
                  <img src={product.images && product.images[0] ? product.images[0] : 'https://placehold.co/600x600'} alt={product.name} className="promo-image" loading="lazy" />
                  {pDiscount > 0 && (
                    <div className="promo-discount-badge">
                      {pDiscount}% OFF
                    </div>
                  )}
                </div>
                
                <div className="promo-info">
                  {product.promotionalText && (
                    <span className="promo-text-badge">{product.promotionalText}</span>
                  )}
                  <h2 className="promo-title">{product.name}</h2>
                  <p className="promo-brand-cat">{product.brand} | {product.category}</p>
                  
                  <div className="promo-pricing">
                    {pDiscount > 0 ? (
                      <>
                        <span className="promo-original-price">₱{pOriginalPrice.toLocaleString(undefined, {minimumFractionDigits: 0})}</span>
                        <span className="promo-sale-price">₱{pSalePrice.toLocaleString(undefined, {minimumFractionDigits: 0})}</span>
                      </>
                    ) : (
                      <span className="promo-sale-price">₱{pOriginalPrice.toLocaleString(undefined, {minimumFractionDigits: 0})}</span>
                    )}
                  </div>
                  
                  <Link to={`/product/${product.id}`} className="btn btn-primary promo-shop-btn">
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (only if > 1 product) */}
      {featuredProducts.length > 1 && (
        <>
          <button className="promo-nav-btn promo-prev" onClick={handlePrev} aria-label="Previous">
            <FaChevronLeft />
          </button>
          <button className="promo-nav-btn promo-next" onClick={handleNext} aria-label="Next">
            <FaChevronRight />
          </button>
          
          {/* Pagination Dots */}
          <div className="promo-dots">
            {featuredProducts.map((_, index) => (
              <button
                key={index}
                className={`promo-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default PromotionalCarousel;
