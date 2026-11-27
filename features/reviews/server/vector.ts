import type { CodeChunk } from "@/features/reviews/types/review";
import { getPineconeIndex } from "@/features/pinecone/client";

const CONTEXT_RESULTS = 10;

export function buildPrNamespace(repoFullName: string, prNumber: number) {
    return `${repoFullName.replace("/", "--")}--pr-${prNumber}`;
}

export async function saveChunksToPinecone(
    namespace: string,
    chunks: CodeChunk[]
) {
    const index = getPineconeIndex();
    const nonEmptyChunks = chunks.filter((chunk) => chunk.text.trim().length > 0);
    if (nonEmptyChunks.length === 0) return;

    const documents = nonEmptyChunks.map((chunk) => ({
        _id: chunk.id,
        title: chunk.filePath,
        chunk_text: chunk.text,
    }));

    // namespace() scopes vectors so this PR never mixes with repo-wide sync data
    await index.namespace(namespace).documents.upsert({ documents });
}


export async function searchPrContext(namespace: string, query: string) {
    const index = getPineconeIndex();

    const response = await index.namespace(namespace).documents.search({
        scoreBy: [{ type: "embed", field: "chunk_text", query }],
        topK: CONTEXT_RESULTS,
        includeFields: ["title", "chunk_text"],
    });

    const snippets: string[] = [];

    for (const match of response.matches) {
        const text = typeof match.chunk_text === "string" ? match.chunk_text : undefined;
        const filePath = typeof match.title === "string" ? match.title : "unknown";
        if (!text) {
            continue;
        }

        snippets.push(`File: ${filePath}\n${text}`);
    }

    return snippets;
}