import { NextResponse } from "next/server";
import { z } from "zod";
import * as cheerio from "cheerio";

const linkPreviewSchema = z.object({
  //It describes the data we expect the client to send us. So we're saying: The request body must contain a url, and that URL must be a valid URL.
  url: z.string().url(),
});

export async function POST(request: Request) {
  try {
    // 1. Read and validate the request body
    const body = await request.json();
    const { url } = linkPreviewSchema.parse(body); //We are reading and parsing the JSON body of the request. We parse the request body using the Zod schema to validate that the URL is valid, and then destructure the validated URL from the resulting object

    // 2. Fetch the webpage using the URL supplied by the client to make an HTTP request to that webpage.
    // Create a controller so the fetch request can be cancelled if it takes too long.
    const controller = new AbortController();

    // Automatically cancel the request after 10 seconds.
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    // Clear the timeout once the request finishes.
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch webpage" },
        { status: 400 },
      );
    }

    // 3. Get the webpage HTML
    const html = await response.text();

    // 4. Parse the HTML
    const $ = cheerio.load(html); //This parses the HTML and gives us the $ selector interface.

    // 5. Extract metadata
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text().trim() ||
      null; //Try og:title
    //       ↓
    // if unavailable, try <title>
    //       ↓
    // if unavailable, return null

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      null;

    const previewImage = $('meta[property="og:image"]').attr("content") || null;

    const favicon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      null;

    // 6. Get the domain from the URL itself
    const domain = new URL(url).hostname; //new URL(url) creates a JavaScript URL object containing different pieces of that URL.
    // for eg protocol -> https: hostname -> www.example.com pathname -> /path/to/page etc. We are using the hostname property to get the domain name of the URL. so new url(url).hostname gives www.example.com. We are storing this in the domain variable to return it to the client.

    function resolveHttpUrl(value: string | null | undefined, baseUrl: string) {
      //this function takes a value (which can be a string, null, or undefined) and a base URL. It attempts to resolve the value into an absolute HTTP or HTTPS URL based on the base URL. If the value is missing or invalid, it returns null.
      if (!value) {
        return null; // Return null if the metadata URL is missing.
      }

      try {
        // Convert relative URLs into absolute URLs using the webpage URL as the base.
        const resolvedUrl = new URL(value, baseUrl);

        if (
          // Only allow HTTP/HTTPS URLs. Ignore unsupported schemes like data: or javascript:.
          resolvedUrl.protocol !== "http:" &&
          resolvedUrl.protocol !== "https:"
        ) {
          return null;
        }

        return resolvedUrl.toString(); // Return the resolved absolute URL.
      } catch {
        return null; // Return null if the URL cannot be parsed.
      }
    }

    // 7. Convert relative URLs into absolute URLs
    const resolvedFavicon = resolveHttpUrl(favicon, url); //if url = https://example.com/articles/page    favicon = /favicon.ico thne ill get https://example.com/favicon.ico

    const resolvedPreviewImage = resolveHttpUrl(previewImage, url);

    // 8. Return the preview data
    return NextResponse.json({
      title,
      description,
      domain,
      favicon: resolvedFavicon,
      previewImage: resolvedPreviewImage,
    });
  } catch (error) {
    console.error("Error generating link preview:", error);

    // Return 400 when the submitted URL fails Zod validation.
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Return 408 when the webpage takes longer than 10 seconds to respond.
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Request timed out" }, { status: 408 });
    }

    // Return 500 for unexpected server-side errors.
    return NextResponse.json(
      { error: "Failed to generate link preview" },
      { status: 500 },
    );
  }
}

// 1. Receive request
//         ↓
// 2. Read JSON body
//         ↓
// 3. Zod validates URL
//         ↓
// 4. Fetch that URL
//         ↓
// 5. Receive HTML
//         ↓
// 6. Cheerio parses HTML
//         ↓
// 7. Extract metadata
//         ↓
// 8. Resolve relative URLs
//         ↓
// 9. Return metadata as JSON
//         ↓
// 10. Handle validation/server errors

//I implemented a dedicated link-preview endpoint that accepts a validated URL, fetches the webpage server-side,
// parses its HTML using Cheerio, extracts Open Graph and standard metadata with fallbacks,
// resolves relative asset URLs into absolute URLs, and returns the metadata to the client.
//  I kept metadata fetching separate from bookmark creation so the user can review and edit the metadata before saving.
