import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Table, Button, Modal, Form, Spinner, Alert, 
  Dropdown, Card, Row, Col, Accordion, Badge
} from 'react-bootstrap';
import { 
  fetchAllUsers, fetchAllDepartments, 
  deleteUser, updateUser, userSignup,
  deleteDepartment, updateDepartment, createDepartment
} from '../api';
import './Admin.css';

const AdminDashboardPage = () => {
  // Data state
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Modal states
  const [showEditDirectorModal, setShowEditDirectorModal] = useState(false);
  const [showAddDirectorModal, setShowAddDirectorModal] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [modalType, setModalType] = useState(null); // 'manager' | 'employee'
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [departmentToEdit, setDepartmentToEdit] = useState(null);
  
  const location = useLocation();
  const companyId = location.state?.company_id;

  // Form states
  const [editDirectorForm, setEditDirectorForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'director',
    company_id: companyId
  });
  const [directorForm, setDirectorForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'director',
    company_id: companyId
  });

  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    company_id: companyId
  });

  const [employeeForm, setEmployeeForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee',
    company_id: companyId,
    department_id: null
  });

  const [managerForm, setManagerForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'manager',
    company_id: companyId,
    department_id: null
  });

  // Check if company has a director
  const hasDirector = users.some(user => user.role === 'director');

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, departmentsData] = await Promise.all([
          fetchAllUsers(),
          fetchAllDepartments()
        ]);
        const companyUsers = usersData.filter(user => user.company_id === companyId);
        const companyDepartments = departmentsData.filter(dept => dept.company_id === companyId);
        
        setUsers(companyUsers);
        setDepartments(companyDepartments);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId]);

  // Form handlers
  const handleDirectorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userSignup(directorForm);
      setSuccess('Director added successfully!');
      const usersData = await fetchAllUsers();
      setUsers(usersData.filter(user => user.company_id === companyId));
      setShowAddDirectorModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createDepartment(departmentForm);
      setSuccess('Department created successfully!');
      const departmentsData = await fetchAllDepartments();
      setDepartments(departmentsData.filter(dept => dept.company_id === companyId));
      setShowAddDepartmentModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userSignup({
        ...employeeForm,
        department_id: employeeForm.department_id || null
      });
      setSuccess('Employee added successfully!');
      const usersData = await fetchAllUsers();
      setUsers(usersData.filter(user => user.company_id === companyId));
      setSelectedDepartment(null);
      setModalType(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManagerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userSignup({
        ...managerForm,
        department_id: managerForm.department_id || null
      });
      setSuccess('Manager added successfully!');
      const usersData = await fetchAllUsers();
      setUsers(usersData.filter(user => user.company_id === companyId));
      setSelectedDepartment(null);
      setModalType(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    if (user.role === 'director') {
      setUserToEdit(user);
      setEditDirectorForm({
        username: user.username,
        email: user.email,
        password: '',
        role: 'director',
        company_id: companyId
      });
      setShowEditDirectorModal(true);
    } else {
      setUserToEdit(user);
      setEmployeeForm({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        company_id: companyId,
        department_id: user.department_id || null
      });
      setShowEditUserModal(true);
    }
  };
  
  // Add this handler
  const handleUpdateDirector = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(userToEdit.id, editDirectorForm);
      setSuccess('Director updated successfully!');
      const usersData = await fetchAllUsers();
      setUsers(usersData.filter(user => user.company_id === companyId));
      setShowEditDirectorModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(userToEdit.id, {
        ...employeeForm,
        department_id: employeeForm.department_id || null
      });
      setSuccess('User updated successfully!');
      const usersData = await fetchAllUsers();
      setUsers(usersData.filter(user => user.company_id === companyId));
      setShowEditUserModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      try {
        await deleteUser(userId);
        setSuccess('User deleted successfully!');
        const usersData = await fetchAllUsers();
        setUsers(usersData.filter(user => user.company_id === companyId));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditDepartment = (department) => {
    setDepartmentToEdit(department);
    setDepartmentForm({
      name: department.name,
      company_id: companyId
    });
    setShowEditDepartmentModal(true);
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDepartment(departmentToEdit.id, departmentForm);
      setSuccess('Department updated successfully!');
      const departmentsData = await fetchAllDepartments();
      setDepartments(departmentsData.filter(dept => dept.company_id === companyId));
      setShowEditDepartmentModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department? All associated users will be unassigned.')) {
      setLoading(true);
      try {
        await deleteDepartment(departmentId);
        setSuccess('Department deleted successfully!');
        const departmentsData = await fetchAllDepartments();
        setDepartments(departmentsData.filter(dept => dept.company_id === companyId));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Navigation handler
  const handleNavigation = (section) => {
    setActiveSection(section);
    if (window.innerWidth <= 768) {
      setSidebarCollapsed(true);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className={`sidebar bg-primary text-white ${sidebarCollapsed ? 'collapsed' : ''}`}></div>
        <div className="main-content d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar bg-primary text-white ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header d-flex justify-content-between align-items-center">
          {!sidebarCollapsed && <h3 className="text-center py-3">Admin Panel</h3>}
          <Button 
            variant="link" 
            className="text-white toggle-btn"
            onClick={toggleSidebar}
          >
            <i className={`fas fa-${sidebarCollapsed ? 'bars' : 'times'}`}></i>
          </Button>
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Button 
              variant="link" 
              className={`nav-link text-white text-left ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavigation('dashboard')}
            >
              <i className="fas fa-tachometer-alt mr-2"></i>
              {!sidebarCollapsed && 'Dashboard'}
            </Button>
          </li>
          <li className="nav-item">
            <Button 
              variant="link" 
              className={`nav-link text-white text-left ${activeSection === 'departments' ? 'active' : ''}`}
              onClick={() => handleNavigation('departments')}
            >
              <i className="fas fa-building mr-2"></i>
              {!sidebarCollapsed && 'Departments'}
            </Button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header d-md-none">
          <Button variant="primary" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </Button>
        </div>

        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

        {/* Dashboard Section */}
        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
        <section id="dashboard">
            <h2 className="mb-4">Company Dashboard</h2>
            
            {!hasDirector && (
            <div className="alert alert-warning mb-4">
                <p>No director has been assigned to this company.</p>
                <Button variant="primary" onClick={() => setShowAddDirectorModal(true)}>
                Add Director
                </Button>
            </div>
            )}

            {/* Company Leadership Section */}
            <Row className="mb-4">
            <Col md={6}>
                <Card className="mb-4">
                <Card.Header className="bg-primary text-white">
                    <h5>Company Leadership</h5>
                </Card.Header>
                <Card.Body>
                    {/* Company Director */}
                    {users.filter(u => u.role === 'director').map(director => (
                    <div key={director.id} className="mb-3">
                        <h6>Director</h6>
                        <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{director.username}</strong>
                            <div className="text-muted">{director.email}</div>
                        </div>
                        <Dropdown drop="up">
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                            Actions
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleEditUser(director)}>
                                Edit
                            </Dropdown.Item>
                            <Dropdown.Item 
                                className="text-danger" 
                                onClick={() => handleDeleteUser(director.id)}
                            >
                                Remove
                            </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        </div>
                    </div>
                    ))}

                    {/* Company Admin */}
                    {users.filter(u => u.role === 'admin').map(admin => (
                    <div key={admin.id} className="mb-3">
                        <h6>Admin</h6>
                        <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{admin.username}</strong>
                            <div className="text-muted">{admin.email}</div>
                        </div>
                        <Dropdown drop="up">
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                            Actions
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleEditUser(admin)}>
                                Edit
                            </Dropdown.Item>
                            <Dropdown.Item 
                                className="text-danger" 
                                onClick={() => handleDeleteUser(admin.id)}
                            >
                                Remove
                            </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        </div>
                    </div>
                    ))}
                </Card.Body>
                </Card>
            </Col>
            
            <Col md={6}>
                {/* Stats Cards */}
                <Row>
                <Col md={12} className="mb-3">
                    <Card className="border-0 bg-white shadow-sm text-info">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="text-muted">Total Employees</h6>
                            <h3>{users.filter(u => u.role === 'employee').length}</h3>
                        </div>
                        <i className="fas fa-users fa-3x opacity-25"></i>
                        </div>
                    </Card.Body>
                    </Card>
                </Col>
                <Col md={12} className="mb-3">
                    <Card className="border-0 bg-white shadow-sm text-success">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="text-muted">Total Departments</h6>
                            <h3>{departments.length}</h3>
                        </div>
                        <i className="fas fa-building fa-3x opacity-25"></i>
                        </div>
                    </Card.Body>
                    </Card>
                </Col>
                <Col md={12} className="mb-3">
                    <Card className="border-0 bg-white shadow-sm text-warning">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="text-muted">Managers</h6>
                            <h3>{users.filter(u => u.role === 'manager').length}</h3>
                        </div>
                        <i className="fas fa-user-tie fa-3x opacity-25"></i>
                        </div>
                    </Card.Body>
                    </Card>
                </Col>
                </Row>
            </Col>
            </Row>
        </section>
        )}


        {/* Departments Section */}
        {activeSection === 'departments' && (
          <section id="departments">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Departments</h2>
              <Button variant="primary" onClick={() => setShowAddDepartmentModal(true)}>
                <i className="fas fa-plus mr-2"></i> Add Department
              </Button>
            </div>

            <Accordion>
              {departments.map(dept => {
                const departmentManager = users.find(user => 
                  user.department_id === dept.id && user.role === 'manager'
                );
                const departmentEmployees = users.filter(user => 
                  user.department_id === dept.id && user.role === 'employee'
                );

                return (
                  <Accordion.Item key={dept.id} eventKey={dept.id}>
                    <Accordion.Header>
                      <div className="d-flex justify-content-between w-100 pe-3">
                        <span>{dept.name}</span>
                        <div>
                          <Badge bg="warning" className="me-2">
                            Manager: {departmentManager ? departmentManager.username : 'None'}
                          </Badge>
                          <Badge bg="info">
                            Employees: {departmentEmployees.length}
                          </Badge>
                        </div>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="mb-4">
                        <div className="d-flex justify-content-between mb-3">
                          <h5>Manager</h5>
                          {!departmentManager && (
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => {
                                setSelectedDepartment(dept);
                                setModalType('manager');
                                setManagerForm(prev => ({
                                  ...prev,
                                  department_id: dept.id
                                }));
                              }}
                            >
                              Add Manager
                            </Button>
                          )}
                        </div>
                        
                        {departmentManager && (
                          <Card>
                            <Card.Body className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{departmentManager.username}</strong>
                                <div className="text-muted">{departmentManager.email}</div>
                              </div>
                              <Dropdown drop='up'>
                                <Dropdown.Toggle variant="outline-secondary" size="sm">
                                  Actions
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={() => handleEditUser(departmentManager)}>
                                    Edit
                                  </Dropdown.Item>
                                  <Dropdown.Item 
                                    className="text-danger" 
                                    onClick={() => handleDeleteUser(departmentManager.id)}
                                  >
                                    Remove
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </Card.Body>
                          </Card>
                        )}
                      </div>

                      <div className="mb-4">
                        <div className="d-flex justify-content-between mb-3">
                          <h5>Employees ({departmentEmployees.length})</h5>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => {
                              setSelectedDepartment(dept);
                              setModalType('employee');
                              setEmployeeForm(prev => ({
                                ...prev,
                                department_id: dept.id
                              }));
                            }}
                          >
                            Add Employee
                          </Button>
                        </div>

                        {departmentEmployees.length > 0 ? (
                          <Table striped bordered hover size="sm">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {departmentEmployees.map(employee => (
                                <tr key={employee.id}>
                                  <td>{employee.username}</td>
                                  <td>{employee.email}</td>
                                  <td>
                                    <Dropdown drop='up'>
                                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                                        Actions
                                      </Dropdown.Toggle>
                                      <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => handleEditUser(employee)}>
                                          Edit
                                        </Dropdown.Item>
                                        <Dropdown.Item 
                                          className="text-danger" 
                                          onClick={() => handleDeleteUser(employee.id)}
                                        >
                                          Remove
                                        </Dropdown.Item>
                                      </Dropdown.Menu>
                                    </Dropdown>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        ) : (
                          <div className="text-muted">No employees in this department</div>
                        )}
                      </div>

                      <div className="d-flex justify-content-end">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleEditDepartment(dept)}
                        >
                          Edit Department
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteDepartment(dept.id)}
                        >
                          Delete Department
                        </Button>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </section>
        )}
        
        <Modal show={showEditDirectorModal} onHide={() => setShowEditDirectorModal(false)}>
        <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>Edit Director</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateDirector}>
            <Modal.Body>
            <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                type="text"
                value={editDirectorForm.username}
                onChange={(e) => setEditDirectorForm({...editDirectorForm, username: e.target.value})}
                required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                type="email"
                value={editDirectorForm.email}
                onChange={(e) => setEditDirectorForm({...editDirectorForm, email: e.target.value})}
                required
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>New Password (leave blank to keep current)</Form.Label>
                <Form.Control
                type="password"
                value={editDirectorForm.password}
                onChange={(e) => setEditDirectorForm({...editDirectorForm, password: e.target.value})}
                />
            </Form.Group>
            <input type="hidden" value={editDirectorForm.role} />
            <input type="hidden" value={editDirectorForm.company_id} />
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditDirectorModal(false)}>
                Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Update Director'}
            </Button>
            </Modal.Footer>
        </Form>
        </Modal>
        {/* Add Director Modal */}
        <Modal show={showAddDirectorModal} onHide={() => setShowAddDirectorModal(false)}>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>Add Company Director</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleDirectorSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  value={directorForm.username}
                  onChange={(e) => setDirectorForm({...directorForm, username: e.target.value})}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={directorForm.email}
                  onChange={(e) => setDirectorForm({...directorForm, email: e.target.value})}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={directorForm.password}
                  onChange={(e) => setDirectorForm({...directorForm, password: e.target.value})}
                  required
                />
              </Form.Group>
              <input type="hidden" value={directorForm.role} />
              <input type="hidden" value={directorForm.company_id} />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAddDirectorModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Add Director'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
        
        {/* Edit Department Modal */}
        <Modal show={showEditDepartmentModal} onHide={() => setShowEditDepartmentModal(false)}>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>Edit Department</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleUpdateDepartment}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Department Name</Form.Label>
                <Form.Control
                  type="text"
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
                  required
                />
              </Form.Group>
              <input type="hidden" value={departmentForm.company_id} />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEditDepartmentModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Update Department'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
          
        {/* Add Department Modal */}
        <Modal show={showAddDepartmentModal} onHide={() => setShowAddDepartmentModal(false)}>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>Add New Department</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleDepartmentSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Department Name</Form.Label>
                <Form.Control
                  type="text"
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
                  required
                />
              </Form.Group>
              <input type="hidden" value={departmentForm.company_id} />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAddDepartmentModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Create Department'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Add Manager Modal */}
        <Modal show={!!selectedDepartment && modalType === 'manager'} onHide={() => {
          setSelectedDepartment(null);
          setModalType(null);
        }}>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>Add Manager to {selectedDepartment?.name}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleManagerSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  value={managerForm.username}
                  onChange={(e) => setManagerForm({...managerForm, username: e.target.value})}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={managerForm.email}
                  onChange={(e) => setManagerForm({...managerForm, email: e.target.value})}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={managerForm.password}
                  onChange={(e) => setManagerForm({...managerForm, password: e.target.value})}
                  required
                />
              </Form.Group>
              <input type="hidden" value={managerForm.department_id} />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => {
                setSelectedDepartment(null);
                setModalType(null);
              }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Add Manager'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Add Employee Modal */}
        <Modal show={!!selectedDepartment && modalType === 'employee'} onHide={() => {
          setSelectedDepartment(null);
          setModalType(null);
        }}>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>Add Employee to {selectedDepartment?.name}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEmployeeSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  value={employeeForm.username}
                  onChange={(e) => setEmployeeForm({...employeeForm, username: e.target.value})}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={employeeForm.password}
                  onChange={(e) => setEmployeeForm({...employeeForm, password: e.target.value})}
                  required
                />
              </Form.Group>
              <input type="hidden" value={employeeForm.department_id} />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => {
                setSelectedDepartment(null);
                setModalType(null);
              }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Add Employee'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Edit User Modal */}
        <Modal show={showEditUserModal} onHide={() => setShowEditUserModal(false)}>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleUpdateUser}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  value={employeeForm.username}
                  onChange={(e) => setEmployeeForm({...employeeForm, username: e.target.value})}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Password (leave blank to keep current)</Form.Label>
                <Form.Control
                  type="password"
                  value={employeeForm.password}
                  onChange={(e) => setEmployeeForm({...employeeForm, password: e.target.value})}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Control
                  as="select"
                  value={employeeForm.department_id || ''}
                  onChange={(e) => setEmployeeForm({
                    ...employeeForm,
                    department_id: e.target.value ? parseInt(e.target.value) : null
                  })}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <input type="hidden" value={employeeForm.role} />
              <input type="hidden" value={employeeForm.company_id} />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEditUserModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Update User'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboardPage;