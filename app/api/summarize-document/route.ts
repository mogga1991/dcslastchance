import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { documentUrl, documentName } = await request.json();

    if (!documentUrl) {
      return NextResponse.json(
        { error: 'Document URL is required' },
        { status: 400 }
      );
    }

    // Fetch the document
    const response = await fetch(documentUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch document' },
        { status: 400 }
      );
    }

    const contentType = response.headers.get('content-type');
    let documentText = '';

    // Handle different document types
    if (contentType?.includes('text/') || contentType?.includes('application/pdf')) {
      try {
        // For PDFs, we'll need to extract text
        if (contentType.includes('application/pdf')) {
          // For now, we'll provide a message that PDF parsing requires additional setup
          // In production, you'd use a PDF parsing library like pdf-parse
          return NextResponse.json({
            summary: `This is a PDF document. To summarize PDFs, you'll need to implement PDF text extraction. Document name: ${documentName || 'Unknown'}`,
            documentName: documentName || getDocumentName(documentUrl),
            success: true,
          });
        } else {
          documentText = await response.text();
        }
      } catch (error) {
        console.error('Error reading document:', error);
        return NextResponse.json(
          { error: 'Failed to read document content' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported document type. Only text and PDF documents are supported.' },
        { status: 400 }
      );
    }

    // Truncate text if it's too long (OpenAI has token limits)
    const maxLength = 15000; // Roughly 4000 tokens
    if (documentText.length > maxLength) {
      documentText = documentText.substring(0, maxLength) + '...';
    }

    // Use OpenAI to summarize the document
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a federal contracting expert. Summarize the following government solicitation document, highlighting key requirements, deadlines, scope of work, and important details that contractors should know. Be concise but thorough.',
        },
        {
          role: 'user',
          content: `Please summarize this solicitation document:\n\n${documentText}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const summary = completion.choices[0]?.message?.content || 'Failed to generate summary';

    return NextResponse.json({
      summary,
      documentName: documentName || getDocumentName(documentUrl),
      success: true,
    });

  } catch (error) {
    console.error('Error summarizing document:', error);
    return NextResponse.json(
      { error: 'Failed to summarize document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function getDocumentName(url: string): string {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return decodeURIComponent(filename);
}
