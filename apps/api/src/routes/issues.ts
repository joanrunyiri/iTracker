import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware); // Protect all issue routes

const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assigneeId: z.string().uuid().optional().nullable(),
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createIssueSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    const result = await prisma.$transaction(async (tx) => {
      const issue = await tx.issue.create({
        data: {
          title: data.title,
          description: data.description,
          assigneeId: data.assigneeId,
          tenantId,
        },
      });

      const auditLog = await tx.auditLog.create({
        data: {
          action: 'CREATED',
          details: `Issue created by ${req.user!.name}`,
          issueId: issue.id,
          userId,
          tenantId,
        },
      });

      return { issue, auditLog };
    });

    res.status(201).json(result.issue);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: (error as any).errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const issues = await prisma.issue.findMany({
      where: { tenantId: req.tenantId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const issue = await prisma.issue.findFirst({
      where: {
        id: id as string,
        tenantId: req.tenantId, // Strict boundary: must belong to the tenant
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        auditLogs: {
          include: {
            user: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!issue) {
      res.status(404).json({ error: 'Issue not found' });
      return;
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const updateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateIssueSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    // First check if issue exists and belongs to tenant
    const existingIssue = await prisma.issue.findFirst({
      where: { id: id as string, tenantId },
    });

    if (!existingIssue) {
      res.status(404).json({ error: 'Issue not found' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedIssue = await tx.issue.update({
        where: { id: id as string },
        data,
      });

      // Simple audit logging for what changed
      const changes: string[] = [];
      if (data.status && data.status !== existingIssue.status) {
        changes.push(`status to ${data.status}`);
      }
      if (data.assigneeId !== undefined && data.assigneeId !== existingIssue.assigneeId) {
         changes.push(data.assigneeId ? `reassigned` : `unassigned`);
      }
      if (data.title && data.title !== existingIssue.title) changes.push('title updated');
      if (data.description !== undefined && data.description !== existingIssue.description) changes.push('description updated');

      if (changes.length > 0) {
        await tx.auditLog.create({
          data: {
            action: 'UPDATED',
            details: `Updated ${changes.join(', ')}`,
            issueId: id as string,
            userId,
            tenantId,
          },
        });
      }

      return updatedIssue;
    });

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: (error as any).errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId!;

    const existingIssue = await prisma.issue.findFirst({
      where: { id: id as string, tenantId },
    });

    if (!existingIssue) {
      res.status(404).json({ error: 'Issue not found' });
      return;
    }

    // Must delete related AuditLogs first due to foreign keys, or rely on cascade.
    // Our schema doesn't have cascade set up explicitly, so we do it in a tx.
    await prisma.$transaction(async (tx) => {
      await tx.auditLog.deleteMany({
        where: { issueId: id as string },
      });
      await tx.issue.delete({
        where: { id: id as string },
      });
    });

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
