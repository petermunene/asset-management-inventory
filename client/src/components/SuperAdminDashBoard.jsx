import React from "react";
import { fetchAllCompanies,updateCompany, fetchAllUsers, fetchGroupedCompanies, deleteCompany } from '../api';
import {
    FaUser, FaBuilding, FaSearch, FaHome, FaUserTie, FaBars,
    FaCheckCircle, FaTimesCircle, FaUserShield
  } from 'react-icons/fa';
export default function SuperAdminDashBoard() {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [companies, setCompanies] = React.useState([]);
    const [users, setUsers] = React.useState([]);
    const [groupedCompanies, setGroupedCompanies] = React.useState([]);
    const [allCompanies, setAllCompanies] = React.useState([]);
    const [superAdmin , setSuperAdmin] = React.useState('');
    const [statusFilter , setStatusFilter] = React.useState('All');
    const [isMobile, setIsMobile] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    React.useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 1200);
      };
      window.addEventListener('resize', handleResize);
      handleResize(); // run on mount
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    React.useEffect(() => {

        async function fetchData() { 
          try {
            const all = await fetchAllCompanies();
            setCompanies(all);
            setAllCompanies(all);
    
            const allUsers = await fetchAllUsers();
            setUsers(allUsers);
    
            const grouped = await fetchGroupedCompanies();
            setGroupedCompanies(grouped);
    
            const super_admin = allUsers.find(user => user.role === 'superadmin');
            if (!super_admin) {
              alert("No superadmin found. Please create one first.");
              return;
            }
            setSuperAdmin(super_admin);
          } catch (error) {
            alert("Error fetching data:", error);
          }
        }
        fetchData();
      }, []);
      React.useEffect(() => {
          if (statusFilter === 'All') {
            setCompanies(allCompanies);
          } else if (statusFilter === 'Approved') {
            setCompanies(groupedCompanies.approved_companies || []);
          } else if (statusFilter === 'Pending') {
            setCompanies(groupedCompanies.pending_companies || []);
          }
        }, [statusFilter, groupedCompanies, allCompanies]);
      const handleDeleteCompany = async (id) => {
            res = await deleteCompany(id);
            if (!res.ok) {
              alert("Error deleting company:", res.error);
              return;
            }
            alert("Company deleted successfully");
            // Update state to remove the deleted company
            setCompanies(prev => prev.filter(company => company.id !== id));
            setAllCompanies(prev => prev.filter(company => company.id !== id));
          };
        const toggleApproval = async (id) => {
            let updatedCompany = null;

            setCompanies((prev) =>
              prev.map((company) => {
                if (company.id === id) {
                  updatedCompany = { ...company, isApproved: !company.isApproved };
                  return updatedCompany;
                }
                return company;
              })
            );

            if (updatedCompany) {
              try {
                await updateCompany(id, { isApproved: updatedCompany.isApproved });
              } catch (error) {
                alert("Failed to update approval status: " + error.message);
              }
            }
          };
        const filteredCompanies = companies.filter(company => 
            company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const iconMap = {
            approved: <FaCheckCircle color="#28a745" size={24} />,
            rejected: <FaTimesCircle color="#dc3545" size={24} />,
            all: <FaBuilding color="#0d6efd" size={24} />,
            admin: <FaUserShield color="#ffc107" size={24} />,
          };
        const getIconForTitle = (title) => {
            const lowercase = title.toLowerCase();
            if (lowercase.includes("approved")) return iconMap.approved;
            if (lowercase.includes("rejected")) return iconMap.rejected;
            if (lowercase.includes("all")) return iconMap.all;
            if (lowercase.includes("admin")) return iconMap.admin;
            return <FaBuilding color="#6c757d" size={24} />;
        }
        const menuSections = [
            {
              label: 'Main',
              items: [
                { icon: <FaHome />, label: 'Dashboard' },
                // { icon: <FaUserTie />, label: 'Users' },
                // { icon: <FaBuilding />, label: 'Companies' },
              ],
            },
            {
              label: 'Stats',
              items: [
                {
                  icon: <FaCheckCircle />,
                  label: `Approved (${groupedCompanies?.approved_companies?.length || 0})`,
                  color: '#198754',
                  bg: '#d1e7dd',
                },
                {
                  icon: <FaTimesCircle />,
                  label: `Rejected (${groupedCompanies?.pending_companies?.length || 0})`,
                  color: '#dc3545',
                  bg: '#f8d7da',
                },
                {
                  icon: <FaBuilding />,
                  label: `All (${companies?.length || 0})`,
                  color: '#0d6efd',
                  bg: '#cfe2ff',
                },
                {
                  icon: <FaUserShield />,
                  label: `Admins (${companies?.length || 0})`, // <- If this is not accurate, use `users?.filter(u => u.role === 'admin')?.length || 0`
                  color: '#6610f2',
                  bg: '#e0cffc',
                },
              ]
            },
          ];
          const statsItems = menuSections.find(section => section.label === 'Stats')?.items;
          const mainContentStyle = {
            padding: '20px',
            flex: 1,
          };
          
          const cardContainerStyle = {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '60px',
            marginTop: '20px',
            overflowX: 'auto',
            paddingBottom: '10px',
            marginLeft: "60px", // <-- this prevents overlap
            transition: 'margin-left 0.3s ease',
          };
          
          // These styles will be overridden in media queries
          const cardStyle = {
            backgroundColor: '#fff',
            borderRadius: '8px',
            height: '100px',
            width: '200px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.3s ease',
          };
          
          // Responsive CSS (vanilla way)
          const responsiveStyle = `
            @media (max-width: 768px) {
              .cardContainer {
                display: none !important;
              }
            }
          `;
          
       
          return (
            <div
              superadminpage=""
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                paddingTop: '60px', // To prevent content hiding behind fixed navbar
              }}
            >
              {/* Navbar */}
              <section className="superAdminNavBar" style={superAdminNavBar}>
                <div className="superAdminNavBar__logo" style={superAdminNavBarLogo}>
                  <div style={iconCircleStyle}>
                    <FaBuilding style={{ color: '#0d6efd', fontSize: '20px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{ margin: 0, fontSize: '18px' }}>admin pro</h1>
                    <h2 style={{ margin: 0, fontSize: '14px', color: '#ccc' }}>
                      Company Management
                    </h2>
                  </div>
                </div>
              </section>
          
              {/* Main content wrapper: sidebar + content */}
              <div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
                {/* Sidebar */}
                <div
                  className="sidebar"
                  style={{
                    ...sidebarStyle,
                    width: isCollapsed ? '60px' : '230px',
                    transition: 'width 0.3s ease',
                  }}
                >
                  {/* Toggle */}
                  <div style={toggleStyle} onClick={() => setIsCollapsed(!isCollapsed)}>
                    <FaBars />
                  </div>
          
                  {/* SuperAdmin Profile */}
                  {superAdmin && (
                    <div style={profileContainer}>
                      <div style={profileCircle}>
                        <FaUser style={{ fontSize: '18px', color: '#0d6efd' }} />
                      </div>
                      {!isCollapsed && (
                        <div style={{ marginLeft: 10 }}>
                          <div style={{ fontWeight: 'bold' }}>{superAdmin.username}</div>
                          <div style={{ fontSize: '12px', color: '#aaa' }}>Super Admin</div>
                        </div>
                      )}
                    </div>
                  )}
          
                  {/* Menu */}
                  {menuSections.map((section, i) => (
                    <div key={i}>
                      {!isCollapsed && <div style={sectionLabel}>{section.label}</div>}
                      {section.items.map((item, j) => (
                        <div
                          key={j}
                          style={{
                            ...menuItemStyle,
                            borderRadius: '8px',
                            margin: '2px 2px',
                            color: item.color || '#333',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = item.bg || '#e6f0ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{ ...iconCircle(item.color || '#0d6efd', item.bg || '#cfe2ff') }}>
                            {item.icon}
                          </div>
                          {!isCollapsed && <span style={{ marginLeft: 10 }}>{item.label}</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
          
                {/* Main Content */}
                <div style={mainContentStyle} className="mainContent">
                  {/* Inject responsive styles */}
                  <style>{responsiveStyle}</style>
          
                  
          
                  <div style={cardContainerStyle} >
                    {statsItems.map((item, index) => (
                      <div
                       className="cardContainer"
                        key={index}
                        style={{ ...cardStyle, backgroundColor: item.bg }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-6px)';
                          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        }}
                      >
                        <div>
                          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#343a40' }}>
                            {item.label}
                          </h3>
                        </div>
                        <div style={{
                          fontSize: '24px',
                          color: item.color,
                          marginLeft: '10px',
                        }}>
                          {item.icon}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='filterControls' style={{ marginTop: '20px', marginBottom: '20px', gap: '5px', display: 'flex', flexDirection: 'row', alignItems: 'center',flexWrap: 'wrap',marginLeft: '60px', transition: 'margin-left 0.3s ease' }}>
                        <button
                        onClick={() => setStatusFilter('All')}
                        style={{
                            ...buttonStyle,
                            backgroundColor: statusFilter === 'All' ? '#3b82f6' : '#e5e7eb',
                            color: statusFilter === 'All' ? '#fff' : '#111827',
                            marginRight: '10px',
                        }}
                        >
                        All
                        </button>
                        <button
                        onClick={() => setStatusFilter('Approved')}
                        style={{
                            ...buttonStyle,
                            backgroundColor: statusFilter === 'Approved' ? '#10b981' : '#e5e7eb',
                            color: statusFilter === 'Approved' ? '#fff' : '#111827',
                            marginRight: '10px',
                        }}
                        >
                        Approved
                        </button>
                        <button
                        onClick={() => setStatusFilter('Pending')}
                        style={{
                            ...buttonStyle,
                            backgroundColor: statusFilter === 'Pending' ? '#f97316' : '#e5e7eb',
                            color: statusFilter === 'Pending' ? '#fff' : '#111827',
                        }}
                        >
                        Pending
                        </button>

                        <input
                        type="text"
                        placeholder="Search"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='superAdminNavBar__search'
                        style={superAdminNavBarSearch}
                        />
                    </div>

                    {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <div key={company.id} style={{
                background: '#fff',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {company.logo ? (
                    <img src={company.logo} alt="Logo" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                  ) : (
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: '#e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaBuilding style={{ color: '#6c757d' }} />
                    </div>
                  )}
                  <div>
                    <h4 style={{ margin: 0 }}>{company.name}</h4>
                    <p style={{ margin: 0, color: '#6c757d' }}>{company.email}</p>
                  </div>
                </div>

                <div>
                  <strong>Admin:</strong> {company.adminEmail}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <span style={{
                    color: company.isApproved ? '#28a745' : '#ffc107',
                    fontWeight: '500'
                  }}>
                    {company.isApproved ? "Approved" : "Pending"}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => toggleApproval(company.id)}
                    style={{
                      ...buttonStyle,
                      background: company.isApproved ? "#f59e0b" : "#10b981"
                    }}
                  >
                    {company.isApproved ? "Withhold" : "Approve"}
                  </button>
                  <button
                    onClick={() => handleDeleteCompany(company.id)}
                    style={{
                      ...buttonStyle,
                      background: "#ef4444"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#6c757d' }}>No companies found</p>
          )}
        </div>
      ) : (
        <div style={{
          overflowX: 'auto',
          backgroundColor: '#fff',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          marginBottom: '40px'
        }}>
          <table style={{
            width: '100%',
            marginLeft: '80px', // <-- this prevents overlap
            minWidth: '800px',
            borderCollapse: 'separate',
            borderSpacing: 0
          }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '50px' }}>Logo</th>
                <th style={thStyle}>Company Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Admin</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <tr key={company.id}>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt="Company logo"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#e9ecef',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto'
                        }}>
                          <FaBuilding style={{ color: '#6c757d' }} />
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: '600' }}>{company.name}</td>
                    <td style={tdStyle}>{company.email}</td>
                    <td style={tdStyle}>{company.adminEmail}</td>
                    <td style={tdStyle}>
                      <span style={{
                        color: company.isApproved ? '#28a745' : '#ffc107',
                        fontWeight: '500'
                      }}>
                        {company.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => toggleApproval(company.id)}
                          style={{
                            ...buttonStyle,
                            background: company.isApproved ? "#f59e0b" : "#10b981"
                          }}
                        >
                          {company.isApproved ? "Withhold" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company.id)}
                          style={{
                            ...buttonStyle,
                            background: "#ef4444"
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ ...tdStyle, textAlign: 'center', color: '#6c757d' }}>
                    No companies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
                </div>
              </div>
            </div>
          );
          
            }
            
            const superAdminNavBar = {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 20px',
              backgroundColor: 'black',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              width: '100%',
              position: 'fixed',
              top: 0,
              height: '50px',
              color: 'white',
              zIndex: 1000,
            };
            
            const superAdminNavBarLogo = {
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
            };
            
            // Circle around FaBuilding
            const iconCircleStyle = {
              backgroundColor: '#cce5ff', // light blue
              borderRadius: '50%',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
            };
            const sidebarStyle = {
                borderTopRightRadius: '8px',
                backgroundColor: '#f8f9fa',
                boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
                minHeight: '100vh',
                paddingTop: '10px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: 0,
                top: 70,
                zIndex: 1000,
              };
              
              const toggleStyle = {
                cursor: 'pointer',
                padding: '10px 15px',
                fontSize: '20px',
                color: '#333',
              };
              
              const profileContainer = {
                display: 'flex',
                alignItems: 'center',
                padding: '10px 15px',
              };
              
              const profileCircle = {
                backgroundColor: '#cfe2ff',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              };
              
              const menuItemStyle = {
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s, color 0.2s',
              };
              
              const sectionLabel = {
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '10px 15px 5px',
                color: '#888',
              };
              
              const iconCircle = (color, bg) => ({
                backgroundColor: bg,
                color: color,
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                fontSize: '14px',
              });
              const superAdminNavBarSearch = {
                maxWidth: '80%',
                minHeight: '30px',
                borderRadius: '30px',
                border: '1px solid #ced4da',
                fontSize: '16px',
              };
              const buttonStyle = {
                padding: "6px 14px",
                fontSize: "13px",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              };
              
              const tableStyle = {
                overflowX: "auto",
                // minWidth: "400px",
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
              };
              
              const thStyle = {
                padding: "14px 16px",
                textAlign: "left",
                backgroundColor: "#f1f5f9",
                color: "#374151",
                fontWeight: 600,
                fontSize: "15px",
                borderBottom: "2px solid #e5e7eb",
              };
              
              const tdStyle = {
                padding: "16px",
                fontSize: "14px",
                color: "#374151",
                borderBottom: "1px solid #e5e7eb",
                verticalAlign: "middle",
              };
              const containerStyle = {
                overflowX: 'auto',
                maxWidth: "1200px",
                width: "100%",
              };
              
