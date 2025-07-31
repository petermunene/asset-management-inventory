//api.js

const API_BASE = "http://localhost:5000";
async function request(endpoint, method = "GET", body = null, retry = true) {
  let token = localStorage.getItem("accessToken");
  const headers = {
    'Authorization': `Bearer ${token}`,
  };

  let payload = body;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: payload,
    credentials: "include",
  });

  if (res.status === 401 && retry) {
    try {
      
      localStorage.setItem("accessToken", newToken);
      return request(endpoint, method, body, false); // retry once with new token
    } catch (err) {
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (res.status === 204) {
    return null;
  }

  const contentType = res.headers.get("Content-Type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = { error: text };
  }

  if (!res.ok) {
    console.error(`Error ${res.status}: ${res.statusText}`, data);
    throw new Error(data.error || "Fetch request failed");
  }

  return data;
}


// ──────── AUTH ────────
export function userLogin(credentials) {
  return request("/users/login", "POST", credentials);
}

// export function superAdminSignup(adminData) {
//   return request("/superadmin/signup", "POST", adminData);
// }

export function superAdminApprove(data) {
  return request("/superadmin/approve", "PATCH", data);
}

// ──────── COMPANIES ────────
export function companySignup(companyData) {
  return request("/companies/signup", "POST", companyData);
}

export function fetchCompany(name) {
  return request(`/companies/get?name=${encodeURIComponent(name)}`);
}

export function updateCompany(id, updates) {
  return request(`/companies/${id}`, "PATCH", updates);
}

export function deleteCompany(id) {
  return request(`/companies/${id}`, "DELETE");
}

export function fetchAllCompanies() {
  return request("/companies/all");
}

export function fetchGroupedCompanies() {
  return request("/companies/grouped");
}

// ──────── USERS ────────
export function userSignup(userData) {
  return request("/users/signup", "POST", userData);
}

export function fetchUser(name) {
  return request(`/users/get?username=${encodeURIComponent(name)}`);
}

export function updateUser(id, updates) {
  return request(`/users/${id}`, "PATCH", updates);
}

export function deleteUser(id) {
  return request(`/users/${id}`, "DELETE");
}

export function fetchAllUsers() {
  return request("/users/all");
}

// ──────── DEPARTMENTS ────────
export function createDepartment(department) {
  return request("/departments", "POST", department);
}

export function fetchDepartment(name) {
  return request(`/departments/get?name=${encodeURIComponent(name)}`);
}

export function updateDepartment(id, updates) {
  return request(`/departments/${id}`, "PATCH", updates);
}

export function deleteDepartment(id) {
  return request(`/departments/${id}`, "DELETE");
}

export function fetchAllDepartments() {
  return request("/departments/all");
}

// ──────── COMPANY ASSETS ────────
export function createCompanyAsset(asset) {
  return request("/company-assets", "POST", asset);
}

export function fetchCompanyAsset(name) {
  return request(`/company-assets/get?name=${encodeURIComponent(name)}`);
}

export function updateCompanyAsset(id, updates) {
  return request(`/company-assets/${id}`, "PATCH", updates);
}

export function deleteCompanyAsset(id) {
  return request(`/company-assets/${id}`, "DELETE");
}

export function fetchAllCompanyAssets() {
  return request("/company-assets/get");
}

// ──────── DEPARTMENT ASSETS ────────
export function createDepartmentAsset(asset) {
  return request("/department-assets", "POST", asset);
}

export function fetchDepartmentAsset(name) {
  return request(`/department-assets/get?name=${encodeURIComponent(name)}`);
}

export function updateDepartmentAsset(id, updates) {
  return request(`/department-assets/${id}`, "PATCH", updates);
}

export function deleteDepartmentAsset(id) {
  return request(`/department-assets/${id}`, "DELETE");
}

export function fetchAllDepartmentAssets() {
  return request("/department-assets/get");
}

// ──────── USER ASSETS ────────
export function createUserAsset(asset) {
  return request("/user-assets", "POST", asset);
}

export function fetchUserAssets(name) {
  return request(`/user-assets/get?username=${encodeURIComponent(name)}`);
}

export function updateUserAsset(id, updates) {
  return request(`/user-assets/${id}`, "PATCH", updates);
}

export function deleteUserAsset(id) {
  return request(`/user-assets/${id}`, "DELETE");
}

export function fetchAllUserAssets() {
  return request("/user-assets/all");
}

// ──────── ASSET REQUESTS ────────
export function createAssetRequest(requestData) {
  return request("/asset-requests", "POST", requestData);
}

export function updateAssetRequest(id, updates) {
  return request(`/asset-requests/${id}`, "PATCH", updates);
}

export function deleteAssetRequest(id) {
  return request(`/asset-requests/${id}`, "DELETE");
}

export function fetchAssetRequests(name) {
  return request(`/asset-requests/get?username=${encodeURIComponent(name)}`);
}
export function fetchAllAssetRequests() {
  return request("/asset-requests/all");
}
export async function refreshToken() {
  console.log(`Bearer ${localStorage.getItem("refreshToken")}`);
  const res = await fetch(`${API_BASE}/refresh`, {
    method: "POST",
    credentials: "include", 
    body: JSON.stringify({}),
    // headers:{
    //   Authorization:`Bearer ${localStorage.getItem("refreshToken")}`,
    // }
  });

  if (!res.ok) {
    throw new Error("Failed to refresh tokens");
  }

  const data = await res.json();
  localStorage.setItem("accessToken", data.access_token);
  return data.access_token;
}
export function startTokenRefreshCycle() {
  refreshToken(); 
  return setInterval(() => {
    refreshToken().catch(() => {
      console.warn("Failed to refresh token");
    });
  }, 4 * 60 * 1000); 
}