import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@airoadmap.dev' },
    update: {},
    create: {
      email: 'admin@airoadmap.dev',
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN',
      subscriptionTier: 'ENTERPRISE',
      subscriptionStatus: 'ACTIVE',
    },
  });

  const author = await prisma.user.upsert({
    where: { email: 'author@airoadmap.dev' },
    update: {},
    create: {
      email: 'author@airoadmap.dev',
      name: 'Content Author',
      passwordHash,
      role: 'AUTHOR',
      subscriptionTier: 'PRO',
      subscriptionStatus: 'ACTIVE',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@airoadmap.dev' },
    update: {},
    create: {
      email: 'user@airoadmap.dev',
      name: 'Test User',
      passwordHash,
      role: 'USER',
      subscriptionTier: 'FREE',
      subscriptionStatus: 'INACTIVE',
    },
  });

  console.log('✅ Users created');

  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'ai-engineer' },
    update: {},
    create: {
      slug: 'ai-engineer',
      title: 'AI Engineer Roadmap',
      description: 'Complete path from software engineer to AI engineer. Master LLMs, RAG, Agents, MLOps, and production AI systems.',
      isPublished: true,
      createdById: author.id,
    },
  });

  console.log('✅ Roadmap created');

  const nodes = await Promise.all([
    prisma.node.create({
      data: {
        roadmapId: roadmap.id,
        type: 'TOPIC',
        title: 'Foundations',
        description: 'Core prerequisites for AI engineering',
        orderIndex: 0,
        positionX: 100,
        positionY: 100,
        estimatedHours: 20,
        difficulty: 'BEGINNER',
        contentMdx: `# Foundations

Before diving into AI engineering, you need solid fundamentals in:

## Mathematics
- **Linear Algebra**: Vectors, matrices, eigenvalues, SVD
- **Calculus**: Derivatives, gradients, chain rule, backpropagation
- **Probability & Statistics**: Distributions, Bayes theorem, hypothesis testing

## Programming
- **Python**: NumPy, Pandas, PyTorch/TensorFlow
- **Software Engineering**: Git, testing, CI/CD, Docker

## Machine Learning Basics
- Supervised vs unsupervised learning
- Bias-variance tradeoff
- Cross-validation
- Feature engineering`,
      },
    }),
    prisma.node.create({
      data: {
        roadmapId: roadmap.id,
        type: 'TOPIC',
        title: 'Deep Learning',
        description: 'Neural networks and modern architectures',
        orderIndex: 1,
        positionX: 300,
        positionY: 100,
        estimatedHours: 40,
        difficulty: 'INTERMEDIATE',
        prerequisites: [],
        contentMdx: `# Deep Learning

## Neural Network Fundamentals
- Perceptrons and multi-layer networks
- Activation functions: ReLU, GELU, Swish
- Loss functions and optimization
- Backpropagation and autograd

## Architectures
- **CNNs**: ResNet, EfficientNet, Vision Transformers
- **RNNs/LSTMs**: Sequence modeling
- **Transformers**: Attention mechanism, BERT, GPT

## Training Techniques
- Regularization: Dropout, weight decay, batch norm
- Learning rate scheduling
- Mixed precision training
- Distributed training`,
      },
    }),
    prisma.node.create({
      data: {
        roadmapId: roadmap.id,
        type: 'TOPIC',
        title: 'LLM Fundamentals',
        description: 'Large Language Models architecture and training',
        orderIndex: 2,
        positionX: 500,
        positionY: 100,
        estimatedHours: 30,
        difficulty: 'INTERMEDIATE',
        prerequisites: [],
        contentMdx: `# LLM Fundamentals

## Transformer Architecture
- Multi-head attention
- Positional embeddings
- Layer normalization
- Feed-forward networks

## Pre-training
- Causal language modeling
- Masked language modeling
- Scaling laws (Chinchilla)
- Data curation and tokenization

## Model Families
- GPT series (OpenAI)
- LLaMA/Mistral (Meta)
- Claude (Anthropic)
- Gemini (Google)`,
      },
    }),
    prisma.node.create({
      data: {
        roadmapId: roadmap.id,
        type: 'TOPIC',
        title: 'RAG Systems',
        description: 'Retrieval-Augmented Generation for knowledge-intensive tasks',
        orderIndex: 3,
        positionX: 700,
        positionY: 100,
        estimatedHours: 25,
        difficulty: 'ADVANCED',
        prerequisites: [],
        contentMdx: `# RAG Systems

## Components
- **Embedding Models**: text-embedding-3-small, bge-large, e5-large
- **Vector Databases**: Pinecone, Weaviate, Qdrant, pgvector
- **Retrieval Strategies**: Dense, sparse, hybrid, reranking

## Advanced Techniques
- Query expansion and rewriting
- Hierarchical retrieval
- Long-context handling
- Evaluation metrics: Recall@k, MRR, NDCG`,
      },
    }),
    prisma.node.create({
      data: {
        roadmapId: roadmap.id,
        type: 'TOPIC',
        title: 'AI Agents',
        description: 'Autonomous agents with tool use, planning, and memory',
        orderIndex: 4,
        positionX: 900,
        positionY: 100,
        estimatedHours: 30,
        difficulty: 'ADVANCED',
        prerequisites: [],
        contentMdx: `# AI Agents

## Core Concepts
- **Tool Use**: Function calling, API integration
- **Planning**: ReAct, Chain-of-Thought, Tree-of-Thought
- **Memory**: Short-term, long-term, episodic
- **Multi-agent**: Collaboration, debate, swarm intelligence

## Frameworks
- LangChain / LangGraph
- AutoGen
- CrewAI
- Custom implementations`,
      },
    }),
    prisma.node.create({
      data: {
        roadmapId: roadmap.id,
        type: 'TOPIC',
        title: 'MLOps & Deployment',
        description: 'Production ML systems: serving, monitoring, CI/CD',
        orderIndex: 5,
        positionX: 1100,
        positionY: 100,
        estimatedHours: 25,
        difficulty: 'ADVANCED',
        prerequisites: [],
        contentMdx: `# MLOps & Deployment

## Model Serving
- Triton, vLLM, TGI, BentoML
- Batch vs online inference
- Model optimization: quantization, distillation, compilation

## Monitoring
- Data drift detection
- Model performance tracking
- Latency and throughput metrics
- Cost optimization

## CI/CD for ML
- Automated testing
- Model registry
- Canary deployments
- Rollback strategies`,
      },
    }),
  ]);

  console.log('✅ Nodes created');

  await Promise.all([
    prisma.edge.create({ data: { roadmapId: roadmap.id, sourceId: nodes[0].id, targetId: nodes[1].id, type: 'PREREQUISITE' } }),
    prisma.edge.create({ data: { roadmapId: roadmap.id, sourceId: nodes[1].id, targetId: nodes[2].id, type: 'PREREQUISITE' } }),
    prisma.edge.create({ data: { roadmapId: roadmap.id, sourceId: nodes[2].id, targetId: nodes[3].id, type: 'PREREQUISITE' } }),
    prisma.edge.create({ data: { roadmapId: roadmap.id, sourceId: nodes[3].id, targetId: nodes[4].id, type: 'PREREQUISITE' } }),
    prisma.edge.create({ data: { roadmapId: roadmap.id, sourceId: nodes[4].id, targetId: nodes[5].id, type: 'PREREQUISITE' } }),
  ]);

  console.log('✅ Edges created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });