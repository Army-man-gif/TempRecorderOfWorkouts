export async function setCookie() {
  await fetch("https://workoutsbackend-yn5p.onrender.com/records/setToken/", {
    method: "GET",
    credentials: "include",
  });
}

export async function getCookieFromBrowser() {
  const fetchTheData = await fetch(
    "https://workoutsbackend-yn5p.onrender.com/records/getToken/",
    {
      method: "GET",
      credentials: "include",
    },
  );
  const cookiesData = await fetchTheData.json();
  return cookiesData.csrftoken;
}
export async function ensureCSRFToken() {
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
