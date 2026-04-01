import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { SaveChecklistDto } from './sop.dto';

@Injectable()
export class SopService {
  constructor(private prisma: PrismaService) {}

  async getTasks() {
    const tasks = await this.prisma.sop_tasks.findMany({
      where: { is_active: true },
      orderBy: [{ category: 'asc' }, { sort_order: 'asc' }],
    });
    return { content: tasks, message: 'SOP tasks berhasil dimuat' };
  }

  async getChecklist(staffId: number, shiftDate: string) {
    const date = new Date(shiftDate);

    const checklist = await this.prisma.sop_checklists.findUnique({
      where: { staff_id_shift_date: { staff_id: staffId, shift_date: date } },
      include: {
        items: {
          include: { task: true },
        },
      },
    });

    const tasks = await this.prisma.sop_tasks.findMany({
      where: { is_active: true },
      orderBy: [{ category: 'asc' }, { sort_order: 'asc' }],
    });

    const checkedMap = new Map<number, { is_checked: boolean; checked_at: Date | null; notes: string | null }>();
    if (checklist) {
      for (const item of checklist.items) {
        checkedMap.set(item.task_id, {
          is_checked: item.is_checked,
          checked_at: item.checked_at,
          notes: item.notes,
        });
      }
    }

    const grouped = {
      OPENING: [] as any[],
      OPERATIONAL: [] as any[],
      CLOSING: [] as any[],
    };

    for (const task of tasks) {
      const checked = checkedMap.get(task.id);
      grouped[task.category].push({
        task_id: task.id,
        description: task.description,
        category: task.category,
        sort_order: task.sort_order,
        is_checked: checked?.is_checked || false,
        checked_at: checked?.checked_at || null,
        notes: checked?.notes || null,
      });
    }

    const totalTasks = tasks.length;
    const completedTasks = [...checkedMap.values()].filter((v) => v.is_checked).length;

    return {
      content: {
        shift_date: shiftDate,
        checklist_id: checklist?.id || null,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        sections: grouped,
      },
      message: 'Checklist berhasil dimuat',
    };
  }

  async saveChecklist(staffId: number, dto: SaveChecklistDto, storeId: number) {
    const date = new Date(dto.shift_date);

    let checklist = await this.prisma.sop_checklists.findUnique({
      where: { staff_id_shift_date: { staff_id: staffId, shift_date: date } },
    });

    if (!checklist) {
      checklist = await this.prisma.sop_checklists.create({
        data: { staff_id: staffId, shift_date: date, store_id: storeId },
      });
    }

    for (const item of dto.items) {
      const existing = await this.prisma.sop_checklist_items.findFirst({
        where: { checklist_id: checklist.id, task_id: item.task_id },
      });

      if (existing) {
        await this.prisma.sop_checklist_items.update({
          where: { id: existing.id },
          data: {
            is_checked: item.is_checked,
            checked_at: item.is_checked ? new Date() : null,
            notes: item.notes || null,
          },
        });
      } else {
        await this.prisma.sop_checklist_items.create({
          data: {
            checklist_id: checklist.id,
            task_id: item.task_id,
            is_checked: item.is_checked,
            checked_at: item.is_checked ? new Date() : null,
            notes: item.notes || null,
          },
        });
      }
    }

    return this.getChecklist(staffId, dto.shift_date);
  }

  // Admin: view all staff checklists for a date
  async getChecklistsByDate(shiftDate: string, storeId: number | null = null) {
    const date = new Date(shiftDate);
    const where: any = { shift_date: date };
    if (storeId) where.store_id = storeId;

    const checklists = await this.prisma.sop_checklists.findMany({
      where,
      include: {
        staff: { select: { id: true, name: true } },
        items: { where: { is_checked: true } },
      },
    });

    const totalTasks = await this.prisma.sop_tasks.count({ where: { is_active: true } });

    return {
      content: checklists.map((c) => ({
        id: c.id,
        staff: c.staff,
        shift_date: c.shift_date,
        completed_tasks: c.items.length,
        total_tasks: totalTasks,
        progress: totalTasks > 0 ? Math.round((c.items.length / totalTasks) * 100) : 0,
      })),
      message: 'Data checklist berhasil dimuat',
    };
  }
}
