import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  // const navigate = useNavigate();

  const handleSignUp = () => {
    // navigate('/company-signup');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
    setActiveSection(sectionId);
  };

  return (
    <div className='full-width-container'>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">Asset Flow</div>
          
          <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
            <a 
              href="#home" 
              className={activeSection === 'home' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('home');
              }}
              onMouseEnter={() => setActiveSection('home')}
            >
              Home
            </a>
            <a 
              href="#about" 
              className={activeSection === 'about' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('about');
              }}
              onMouseEnter={() => setActiveSection('about')}
            >
              About
            </a>
            <a 
              href="#contact" 
              className={activeSection === 'contact' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
              onMouseEnter={() => setActiveSection('contact')}
            >
              Contact
            </a>
          </div>
          
          <button className="navbar-toggle" onClick={toggleMenu}>
            <span className="hamburger"></span>
          </button>
        </div>
      </nav>

      <div className="home-container">
        {/* Hero Section */}
        <section id="home" className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Streamline Your Asset Management</h1>
              <p>Transform your business with our comprehensive asset management and inventory solutions. Track, manage, and optimize your resources with enterprise-grade precision.</p>
              <div className="hero-form">
                <input type="text" placeholder="Enter your email" className="email-input" />
                <button className="signup-btn" onClick={handleSignUp}>Sign Up Company</button>
              </div>
            </div>
            <div className="hero-image">
              <img 
                src="https://www.technologysolutions.net/wp-content/uploads/2024/08/AdobeStock_736652749-scaled-2560x1280.jpeg" 
                alt="Asset Management Dashboard"
                className="dashboard-image"
              />
              <div className="hero-stats">
                <div className="stat-overlay">
                  <span className="stat-value">99.9%</span>
                  <span className="stat-label">Uptime Guarantee</span>
                </div>
                <div className="stat-overlay support">
                  <span className="stat-value">24/7</span>
                  <span className="stat-label">Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section id="about" className="why-choose-section">
          <div className="why-choose-content">
            <div className="why-choose-text">
              <h2>Why Choose Our Platform?</h2>
              <p>We're not just another software company. We're your strategic partner in digital transformation, helping businesses optimize their asset management with cutting-edge technology and unparalleled expertise.</p>
              
              <div className="features-list">
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>15+ years of industry experience</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Trusted by 500+ companies worldwide</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>99.9% uptime guarantee</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>24/7 dedicated support</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>ISO 27001 certified security</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>ROI increase up to 40%</span>
                </div>
              </div>

              <button className="start-journey-btn" onClick={handleSignUp}>Start Your Journey Today</button>
            </div>

            <div className="trusted-stats">
              <h3>Trusted by Industry Leaders</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon companies">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#4A90E2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <span className="stat-number">500+</span>
                  <span className="stat-desc">Companies Served</span>
                </div>
                <div className="stat-card">
                  <div className="stat-icon experience">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#4A90E2">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="stat-number">15+</span>
                  <span className="stat-desc">Years Experience</span>
                </div>
                <div className="stat-card">
                  <div className="stat-icon uptime">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#4A90E2">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="stat-number">99.9%</span>
                  <span className="stat-desc">Uptime Guarantee</span>
                </div>
                <div className="stat-card">
                  <div className="stat-icon support">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#4A90E2">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                  <span className="stat-number">24/7</span>
                  <span className="stat-desc">Support Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ready to Get Started CTA */}
          <div className="ready-to-start">
            <h3>Ready to Get Started?</h3>
            <p>Join hundreds of companies already transforming their asset management.</p>
            <div className="cta-form">
              <input type="text" placeholder="Enter your email" className="email-input" />
              <button className="signup-btn" onClick={handleSignUp}>Get Started</button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="services-section">
          <h2>Our Services</h2>
          <p>Comprehensive asset management solutions designed to transform how your company tracks, manages, and optimizes its resources.</p>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#4A90E2">
                  <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10 2 10 2 10 2 9 2.54 8.5 3.35l-.5.68-.5-.67C6.64 2.51 6 2.51 6 2.51 6 2.51 5.5 2.95 5 5c0 .35.07.69.18 1H3c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h17c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 13H4V8h16v11z"/>
                </svg>
              </div>
              <h3>Asset Tracking</h3>
              <p>Real-time tracking of all your physical and digital assets with comprehensive analytics and reporting.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#4A90E2">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </div>
              <h3>Inventory Management</h3>
              <p>Streamlined inventory control with automated alerts, stock optimization, and demand forecasting.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#4A90E2">
                  <path d="M18,8c0-3.31-2.69-6-6-6S6,4.69,6,8c0,4.5,6,11,6,11S18,12.5,18,8z M10,8c0-1.1,0.9-2,2-2s2,0.9,2,2 c0,1.1-0.9,2-2,2S10,9.1,10,8z"/>
                </svg>
              </div>
              <h3>Security & Compliance</h3>
              <p>Enterprise-grade security with full compliance reporting and audit trails for all asset movements.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#4A90E2">
                  <path d="M22,5.5L20.5,4l-3,3l-1.5-1.5L14.5,7L18,10.5L22,6.5L22,5.5z M7.91,10.08L6.5,8.66L5.08,10.08L6.5,11.5L7.91,10.08z M13,1v3h8V1H13z M19,8.5h2.5V7H19V8.5z"/>
                </svg>
              </div>
              <h3>Automated Workflows</h3>
              <p>Intelligent automation for asset procurement, maintenance scheduling, and lifecycle management.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#4A90E2">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 7H16.5c-.8 0-1.54.5-1.85 1.26l-1.92 5.75c-.18.55.15 1.13.7 1.31.55.18 1.13-.15 1.31-.7l.7-2.12 1.78 5.32A2 2 0 0 0 18.13 18H20z"/>
                </svg>
              </div>
              <h3>Team Collaboration</h3>
              <p>Multi-user access with role-based permissions and real-time collaboration tools.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#4A90E2">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <h3>Analytics & Insights</h3>
              <p>Advanced analytics and predictive insights to optimize asset utilization and reduce costs.</p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
<section id="contact" className="contact-section">
  <h2>Contact Us</h2>
  <p>Get in touch with our team for more information about our asset management solutions</p>
  
  <div className="contact-content">
    <div className="contact-info">
      <div className="contact-card">
        <div className="contact-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#4A90E2">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
        <h3>Email Us</h3>
        <p>support@assetflow.com</p>
      </div>

      <div className="contact-card">
        <div className="contact-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#4A90E2">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        </div>
        <h3>Call Us</h3>
        <p>+1 (800) 555-1234</p>
      </div>

      <div className="contact-card">
        <div className="contact-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#4A90E2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <h3>Visit Us</h3>
        <p>123 Asset Street<br />San Francisco, CA 94107</p>
      </div>
    </div>
  </div>
</section>

        
      </div>
    </div>
  );
};

export default HomePage;