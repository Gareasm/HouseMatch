async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = '/login';
    return;
  }

  return response;
}

export default apiFetch;