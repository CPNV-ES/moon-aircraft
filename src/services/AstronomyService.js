const APPLICATION_ID = 'e68a1c24-3e2b-46f1-9d4f-113620ab68df';
const APPLICATION_SECRET = '4ea2d420e8e65fa591da4cc0ddef4c7ad210b4ec734d7cc4ad966f46e529cc35a2270caec910f5d934ec886a6253a898fc6c8035db9cc897ab6f029f44bbe99db93ff0411eb7de6babde6e18af3f35060ffab1ab6b428fc2b474227ae707f2475ecaa3122a2c52f1985e2ec53f9d2603';
const ASTRONOMY_API_URL = 'https://api.astronomyapi.com/api/v2/studio/moon-phase';

const hash = btoa(`${APPLICATION_ID}:${APPLICATION_SECRET}`);

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
          moonStyle: 'default',
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
