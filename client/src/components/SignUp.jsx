import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {userSignup,companySignup} from "../api"; // Adjust the import path as necessary


const CompanySignup = () => {
  const [showAdmin, setShowAdmin] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: "",
    email: "",
    logo: null,
  });

  const [adminData, setAdminData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  // ⬇️ Inject mobile styles once on mount
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      @media (max-width: 768px) {
        .cardinfo {
          flex-direction: column !important;
          height: auto !important;
          width: 95% !important;
          border-radius: 1rem !important;
        }

        .panel {
          flex: 1 1 100% !important;
          padding: 20px !important;
          border-radius: 0 !important;
        }

        .form-panel {
          padding: 20px !important;
        }

        h2 {
          font-size: 1.4rem !important;
        }

        input, button {
          font-size: 1rem !important;
        }
      }
    `;
    document.head.appendChild(styleTag);
  }, []);

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100vw",
    height: "100vh",
    fontFamily: "'Poppins', sans-serif",
    background: "linear-gradient(135deg, #1f1c2c, #928dab)",
    position: "relative",
    overflow: "hidden",
  };

  const cardStyle = {
    width: "85%",
    maxWidth: "1000px",
    height: "550px",
    display: "flex",
    borderRadius: "2rem",
    overflow: "hidden",
    boxShadow: "0 0 40px rgba(0, 0, 0, 0.3)",
    background: "#fff",
    position: "relative",
    zIndex: 1,
  };

  const infoPanelStyle = {
    flex: 1,
    padding: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    borderRadius: "0 50% 50% 0",
    overflow: "hidden",
    position: "relative",
  };

  const formPanelStyle = {
    flex: 1,
    backgroundColor: "#fff",
    padding: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "2rem",
  };

  const buttonStyle = {
    marginTop: "30px",
    padding: "12px 25px",
    border: "none",
    background: "#6a3093",
    color: "#fff",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "16px",
  };

  const inputStyle = () => ({
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "14px",
  });

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.92, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const panelVariants = {
    initial: { x: showAdmin ? "-100%" : "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: showAdmin ? "100%" : "-100%", opacity: 0 },
    transition: { type: "spring", stiffness: 90, damping: 20 },
  };

  const bgVariants = {
    company: { background: "linear-gradient(135deg, #1e3c72, #2a5298)" },
    admin: { background: "linear-gradient(145deg, #ff758c, #ff7eb3)" },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08 + 0.2, duration: 0.35 },
    }),
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.97 },
  };

  const particles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
  }));

  const handleCompanyChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      setCompanyData({ ...companyData, logo: files[0] });
    } else {
      setCompanyData({ ...companyData, [name]: value });
    }
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminData({ ...adminData, [name]: value });
  };

  const handleCompanySubmit = (e) => {
    e.preventDefault();
    setShowAdmin(true);
  };

  const handleFinalSubmit = async () => {
    if (
      !companyData.name ||
      !companyData.email ||
      !companyData.logo ||
      !adminData.username ||
      !adminData.email ||
      !adminData.password
    ) {
      alert("Please fill in all company and admin details before submitting.");
      return;
    }
    const CompanyData = new FormData();
    CompanyData.append("name", companyData.name);
    CompanyData.append("email", companyData.email);
    CompanyData.append("logo_url", companyData.logo);
    try {
      
      const companyResponse = await companySignup(CompanyData);
      console.log("Company created:", companyResponse);
    // 🟡 Depending on your API, adjust how to get the ID:
    const companyId = companyResponse.id || companyResponse.data?.id;

    if (!companyId) {
      throw new Error("Failed to retrieve company ID from response.");
    }

    
    const AllAdminData = {
      username: adminData.username,
      email: adminData.email,
      password: adminData.password,
      role: "company_admin",
      company_id: companyId, // ✅ Add the ID here
    };

    // 3. Create the admin user
    const adminResponse = await userSignup(AllAdminData);
    console.log("Admin created:", adminResponse);

    alert("Company and Admin account created successfully!");
    navigate("/login"); 
    }
    catch (error) {
      console.error("Error during signup:", error);
      alert("Failed to create company or admin account. Please try again.");
    }
  };

  return (
    <div style={containerStyle}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "rgba(255,255,255,0.15)",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 0,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="cardinfo"
        style={cardStyle}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="panel"
          style={infoPanelStyle}
          variants={bgVariants}
          animate={showAdmin ? "admin" : "company"}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <AnimatePresence mode="wait">
            {!showAdmin ? (
              <motion.div
                key="companyMessage"
                {...panelVariants}
                style={{ textAlign: "center" }}
              >
                <h2>Grow your company with better asset management</h2>
                <p style={{ fontSize: "14px", marginTop: "10px" }}>
                  Streamline how your business tracks and manages assets.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="adminMessage"
                {...panelVariants}
                style={{ textAlign: "center" }}
              >
                <h2>Let’s set up your admin account</h2>
                <p style={{ fontSize: "14px", marginTop: "10px" }}>
                  This helps you control everything within your company system.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="form-panel" style={formPanelStyle}>
          <AnimatePresence mode="wait">
            {!showAdmin ? (
              <motion.form
                key="companyForm"
                {...panelVariants}
                style={{ width: "100%" }}
                onSubmit={handleCompanySubmit}
              >
                <h2>Company Sign Up</h2>

                <motion.input
                  name="name"
                  required
                  value={companyData.name}
                  onChange={handleCompanyChange}
                  type="text"
                  placeholder="Company Name"
                  style={inputStyle()}
                  custom={0}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                />

                <motion.input
                  name="email"
                  required
                  value={companyData.email}
                  onChange={handleCompanyChange}
                  type="email"
                  placeholder="Company Email"
                  style={inputStyle()}
                  custom={1}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                />
                <label htmlFor="logoUpload" style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  backgroundColor: "grey",
                  color: "#fff",
                  borderRadius: "30px",
                  cursor: "pointer",
                  marginTop: "10px"
                }}>
                  Upload Logo
                </label> <br></br><br></br>
                <motion.input
                  name="logo"
                  required
                  onChange={handleCompanyChange}
                  type="file"
                  accept="image/*"
                  capture="environment"
                   // hide default button
                  id="logoUpload"
                  custom={2}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                />

                <motion.button
                  type="submit"
                  style={buttonStyle}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Next: Admin Setup →
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="adminForm"
                {...panelVariants}
                style={{ width: "100%" }}
              >
                <h2>Admin Sign Up</h2>

                <motion.input
                  name="username"
                  required
                  value={adminData.username}
                  onChange={handleAdminChange}
                  type="text"
                  placeholder="Full Name"
                  style={inputStyle()}
                  custom={0}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                />

                <motion.input
                  required
                  name="email"
                  value={adminData.email}
                  onChange={handleAdminChange}
                  type="email"
                  placeholder="Email"
                  style={inputStyle()}
                  custom={1}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                />

                <motion.input
                  name="password"
                  required
                  value={adminData.password}
                  onChange={handleAdminChange}
                  type="password"
                  placeholder="Password"
                  style={inputStyle()}
                  custom={2}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                />

                <motion.button
                  style={buttonStyle}
                  onClick={handleFinalSubmit}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Finish Sign Up 
                </motion.button>
                <br></br>
                <motion.button
                  style={{
                    ...buttonStyle,
                    background: "transparent",
                    border: "1px solid #6a3093",
                    color: "#6a3093",
                    marginTop: "10px",
                  }}
                  onClick={() => setShowAdmin(false)}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  ← Go Back
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CompanySignup;
