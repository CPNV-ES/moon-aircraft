const APPLICATION_ID = 'f2ff8c2b-b66a-497a-b0cc-3b7ac0e04534';
const APPLICATION_SECRET = 'c843c59e5aaa82ac51f8ce2c45ee2ec187d9c5cd68244c6037c5f52f31ef6a4ad99e37ff704eacbc3c22667c557bfc18d2e5ac9fb43b8ea3750c0a2238b28b730e1eaa0400cea7e485c0c787b255262f135e1dae29ce142fe002aa67675d4c16118a4099323e0a935e67b8d1d055fd80';
const ASTRONOMY_API_URL = 'https://api.astronomyapi.com/api/v2/studio/moon-phase';

const hash = btoa(`${APPLICATION_ID}:${APPLICATION_SECRET}`);

/**
 * Fetches a dynamic moon texture URL from the Astronomy API.
 * This is an insecure method for testing purposes only.
 * @returns {Promise<string|null>} The URL of the generated moon image or null on failure.
 */
export async function fetchMoonTextureUrl() {
  const today = new Date().toISOString().split('T')[0];

  try {
    const response = await fetch(ASTRONOMY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${hash}`
      },
      body: JSON.stringify({
        format: 'png',
        style: {
          moonStyle: 'shaded',
          backgroundStyle: 'solid',
          backgroundColor: 'transparent'
        },
        observer: {
          latitude: 46.2044,
          longitude: 6.1432,
          date: today
        },
        view: {
          type: 'portrait-simple'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Astronomy API failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Successfully fetched moon image URL:", data.data.imageUrl);
    return data.data.imageUrl;

  } catch (error) {
    console.error("Failed to fetch moon texture from Astronomy API:", error);
    return null;
  }
}