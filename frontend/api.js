import { API_URL } from "./config";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // non-JSON body
  }
  if (!res.ok) {
    throw new Error((data && data.message) || `Request failed (${res.status})`);
  }
  return data;
}

export const login = (username, password) =>
  request("/login", { method: "POST", body: JSON.stringify({ username, password }) });
export const register = (username, password) =>
  request("/register", { method: "POST", body: JSON.stringify({ username, password }) });
export const getEmployees = () => request("/employees");
export const addEmployee = (employee) =>
  request("/employees", { method: "POST", body: JSON.stringify(employee) });
export const updateEmployee = (id, employee) =>
  request(`/employees/${id}`, { method: "PUT", body: JSON.stringify(employee) });
export const toggleStatus = (id) => request(`/employees/${id}/status`, { method: "PUT" });
export const deleteEmployee = (id) => request(`/employees/${id}`, { method: "DELETE" });
export const getSalaryClusters = () => request("/employees/salary-clusters");
