export async function setCookie() {
  await fetch("https://workoutsbackend-yn5p.onrender.com/records/setToken/", {
    method: "GET",
    credentials: "include",
  });
  return new Promise((resolve) => setTimeout(resolve, 100));
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
    // wait until cookie actually exists
    for (let i = 0; i < 10; i++) {
      token = await getCookieFromBrowser("csrftoken");
      if (token) break;
      await new Promise((r) => setTimeout(r, 100)); // wait 100ms
    }
  }
  return token;
}
