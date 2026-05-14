/* src/pages/api/search.json.ts */
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

/**
 * GET Endpoint for the global search index.
 * Accessible via: GET /api/search.json
 * Purpose: Provides a lightweight JSON array for the Navbar search component.
 */
export const GET: APIRoute = async () => {
  try {
    // 1. Fetch the complete collection of specimens from the data layer
    const allMobs = await getCollection('archive');

    // 2. Strip down the massive objects to only the essential fields needed for search
    // This reduces the payload size from megabytes to just a few kilobytes.
    const searchIndex = allMobs.map((mob) => ({
      id: mob.id,
      name: mob.data.name,
      era: mob.data.era,
      tags: mob.data.tags,
      // Prioritize the male visual as the thumbnail. Fallback to a placeholder if null.
      thumbnail: mob.data.visuals?.male || '/images/placeholder.png' 
    }));

    // 3. Return the optimized data with aggressive caching headers
    return new Response(JSON.stringify(searchIndex), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache-Control: Instructs the browser to cache this data for 1 hour (3600 seconds)
        // Since encyclopedia data rarely changes minute-by-minute, this saves massive bandwidth.
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    // Fallback error handling to prevent the API from crashing silently
    return new Response(JSON.stringify({ error: "Failed to generate search index" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};