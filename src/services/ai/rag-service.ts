import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import { prisma } from '@/db/client';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

interface SearchOptions {
  query: string;
  roadmapId?: string;
  nodeId?: string;
  limit: number;
  threshold: number;
  userId: string;
}

interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
  title: string;
  roadmapId: string;
  nodeId: string | null;
}

interface IngestOptions {
  roadmapId: string;
  nodeId?: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    let end = start + CHUNK_SIZE;
    
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      
      if (breakPoint > start + CHUNK_SIZE * 0.5) {
        end = breakPoint + 1;
      }
    }
    
    chunks.push(text.slice(start, end).trim());
    start = end - CHUNK_OVERLAP;
  }
  
  return chunks.filter(c => c.length > 50);
}

function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function ingestDocument(options: IngestOptions) {
  const { roadmapId, nodeId, title, content, metadata } = options;
  
  const contentHash = hashContent(content);
  const existing = await prisma.document.findFirst({
    where: { roadmapId, contentHash },
  });
  
  if (existing) {
    logger.info({ documentId: existing.id }, 'Document already exists, skipping');
    return existing;
  }

  const chunks = chunkText(content);
  const embeddings = await Promise.all(
    chunks.map(chunk => embed({ model: openai.embedding(EMBEDDING_MODEL), value: chunk }))
  );

  const documents = await Promise.all(
    chunks.map((chunk, index) => 
      prisma.document.create({
        data: {
          roadmapId,
          nodeId,
          title: `${title} (chunk ${index + 1}/${chunks.length})`,
          content: chunk,
          contentHash: hashContent(chunk),
          embedding: embeddings[index].embedding as any,
          metadata: { ...metadata, chunkIndex: index, totalChunks: chunks.length },
        },
      })
    )
  );

  logger.info({ roadmapId, nodeId, chunks: documents.length }, 'Document ingested');
  return documents[0];
}

export async function searchDocuments(options: SearchOptions): Promise<SearchResult[]> {
  const { query, roadmapId, nodeId, limit, threshold, userId } = options;
  
  const { embedding } = await embed({ model: openai.embedding(EMBEDDING_MODEL), value: query });
  
  const where: any = {};
  if (roadmapId) where.roadmapId = roadmapId;
  if (nodeId) where.nodeId = nodeId;

  const results = await prisma.$queryRaw`
    SELECT 
      id, content, title, roadmap_id as "roadmapId", node_id as "nodeId", metadata,
      1 - (embedding <=> ${embedding}::vector) as score
    FROM documents
    WHERE ${prisma.$queryRaw`${where}`}
    AND 1 - (embedding <=> ${embedding}::vector) > ${threshold}
    ORDER BY embedding <=> ${embedding}::vector
    LIMIT ${limit}
  ` as SearchResult[];

  logger.debug({ query, results: results.length, userId }, 'RAG search completed');
  return results;
}

export async function deleteDocument(id: string) {
  await prisma.document.delete({ where: { id } });
  logger.info({ documentId: id }, 'Document deleted');
}

export async function reindexNode(nodeId: string) {
  await prisma.document.deleteMany({ where: { nodeId } });
  
  const node = await prisma.node.findUnique({
    where: { id: nodeId },
    select: { id: true, title: true, contentMdx: true, description: true, roadmapId: true },
  });
  
  if (!node || !node.contentMdx) return { indexed: 0 };
  
  await ingestDocument({
    roadmapId: node.roadmapId,
    nodeId: node.id,
    title: node.title,
    content: node.contentMdx,
    metadata: { type: 'node_content', description: node.description },
  });
  
  return { indexed: 1 };
}