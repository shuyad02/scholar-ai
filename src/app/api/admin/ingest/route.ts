import { NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { ingestScholarshipDocument } from "@/lib/rag";
import { successResponse, errorResponse, AppError } from "@/lib/api-response";
import { z } from "zod";

const IngestDocumentSchema = z.object({
  scholarshipId: z.string().cuid("Invalid scholarship ID"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  contentText: z.string().min(50, "Document text must be at least 50 characters to chunk effectively"),
  sourceUrl: z.string().url("Must be a valid URL").optional(),
});

/**
 * POST /api/admin/ingest
 * Protected Admin Endpoint to ingest official scholarship documentation and trigger RAG vector indexing.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdminUser(req);
    const body = await req.json();
    const validated = IngestDocumentSchema.parse(body);

    const doc = await ingestScholarshipDocument(
      validated.scholarshipId,
      validated.title,
      validated.contentText,
      validated.sourceUrl
    );

    return successResponse(
      doc,
      "Official document ingested and vector chunks successfully generated.",
      undefined,
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}
