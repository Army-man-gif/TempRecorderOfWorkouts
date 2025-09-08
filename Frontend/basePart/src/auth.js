const intialBackendString = "https://workoutsBackend-qta1.onrender.com/records";

export async function getCookieFromBrowser() {
  const fetchTheData = await fetch(`${intialBackendString}/getToken/`, {
    method: "GET",
    credentials: "include",
  });
  const cookiesData = await fetchTheData.json();
  return cookiesData.csrftoken;
}
