import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PDFViewer } from "@/components/proposaliq/pdf-viewer";
import { getDocumentWithUrl } from "@/lib/proposaliq/storage";

type PageProps = {
  params: Promise<{ documentId: string }>;
  searchParams: Promise<{ page?: string; highlight?: string }>;
};

async function DocumentViewerContent({
  documentId,
  page,
  highlight
}: {
  documentId: string;
  page?: string;
  highlight?: string;
}) {
  let doc;

  try {
    doc = await getDocumentWithUrl(documentId);
  } catch (error) {
    console.error("Failed to load document:", error);
    notFound();
  }

  const initialPage = page ? parseInt(page, 10) : 1;

  return (
    <div className="h-screen w-full">
      <PDFViewer
        url={doc.url}
        filename={doc.filename}
        initialPage={initialPage}
        highlightText={highlight}
      />
    </div>
  );
}

export default async function DocumentViewerPage({ params, searchParams }: PageProps) {
  const { documentId } = await params;
  const { page, highlight } = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="text-muted-foreground">Loading document...</div>
        </div>
      }
    >
      <DocumentViewerContent
        documentId={documentId}
        page={page}
        highlight={highlight}
      />
    </Suspense>
  );
}

export const metadata = {
  title: "Document Viewer | ProposalIQ",
  description: "View opportunity documents",
};
