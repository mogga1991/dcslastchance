import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/sam-documents
 * Fetch real document filenames from SAM.gov file URLs
 *
 * SAM.gov's resourceLinks don't include filenames - they're GUID-based download URLs.
 * This endpoint fetches HTTP headers to extract actual filenames from Content-Disposition.
 *
 * Query params:
 * - urls: Comma-separated list of document URLs (up to 50)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const urlsParam = searchParams.get('urls');

  if (!urlsParam) {
    return NextResponse.json(
      { error: 'urls parameter is required' },
      { status: 400 }
    );
  }

  const urls = urlsParam.split(',').slice(0, 50); // Limit to 50 URLs

  try {
    // Fetch filenames in parallel by checking HTTP headers
    const filenamePromises = urls.map(async (url, index) => {
      try {
        // HEAD request to get headers without downloading the file
        const response = await fetch(url, {
          method: 'HEAD',
          redirect: 'follow'
        });

        if (!response.ok) {
          return {
            url,
            name: `Document ${index + 1}`,
            error: `HTTP ${response.status}`
          };
        }

        // Try to extract filename from Content-Disposition header
        const contentDisposition = response.headers.get('content-disposition');
        let filename = null;

        if (contentDisposition) {
          // Parse: attachment; filename="My Document.pdf"
          const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            filename = match[1].replace(/['"]/g, '');
            filename = decodeURIComponent(filename);
          }
        }

        // If no Content-Disposition, try to get from URL path
        if (!filename) {
          filename = extractFilenameFromUrl(url);
        }

        // Fallback to numbered document
        if (!filename) {
          filename = `Document ${index + 1}`;
        }

        return {
          url,
          name: filename,
          contentType: response.headers.get('content-type'),
          size: response.headers.get('content-length')
        };

      } catch (error) {
        console.error(`Error fetching filename for ${url}:`, error);
        return {
          url,
          name: `Document ${index + 1}`,
          error: 'Failed to fetch'
        };
      }
    });

    const documents = await Promise.all(filenamePromises);

    return NextResponse.json({ documents });

  } catch (error) {
    console.error('Error fetching document metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document metadata' },
      { status: 500 }
    );
  }
}

/**
 * Try to extract a meaningful filename from a URL
 */
function extractFilenameFromUrl(url: string): string | null {
  try {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];

    // Remove "download" suffix if present
    const cleaned = lastPart.replace(/\/download$/, '');
    const decoded = decodeURIComponent(cleaned);

    // Check if it looks like a real filename (has extension, not just GUID)
    if (decoded && decoded.includes('.') && !decoded.match(/^[0-9a-f-]{36}$/i)) {
      return decoded;
    }

    return null;
  } catch {
    return null;
  }
}
