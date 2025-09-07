const intialBackendString = "https://workoutsBackend-qta1.onrender.com/records";

export async function setCookie() {
  await fetch(`${intialBackendString}/setToken/`, {
    method: "GET",
    credentials: "include",
  });
}

export async function getCookieFromBrowser() {
  const fetchTheData = await fetch(`${intialBackendString}/getToken/`, {
    method: "GET",
    credentials: "include",
  });
  const cookiesData = await fetchTheData.json();
  return cookiesData.csrftoken;
}
export async function ensureCSRFToken() {
  await setCookie();
  let token = await getCookieFromBrowser("csrftoken");
  if (!token) {
    await setCookie();
    for (let i = 0; i < 10; i++) {
      token = await getCookieFromBrowser("csrftoken");
      if (token) break;
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  return token;
}
