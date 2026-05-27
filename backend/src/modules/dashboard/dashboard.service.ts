import { prisma } from '../../lib/prisma';
import { LeadStatus } from '@prisma/client';

export async function getAdminDashboardService() {
  const [
    totalLeads,
    interestedLeads,
    convertedLeads,
    notInterestedLeads,
    totalEmployees,
    leadsPerMonth,
    employeePerformance,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: LeadStatus.INTERESTED } }),
    prisma.lead.count({ where: { status: LeadStatus.CONVERTED } }),
    prisma.lead.count({ where: { status: LeadStatus.NOT_INTERESTED } }),
    prisma.user.count({ where: { role: 'EMPLOYEE', isActive: true } }),
    getLeadsPerMonth(),
    getEmployeePerformance(),
  ]);

  const statusDistribution = [
    { status: 'Interested', count: interestedLeads, color: '#3b82f6' },
    { status: 'Converted', count: convertedLeads, color: '#22c55e' },
    { status: 'Not Interested', count: notInterestedLeads, color: '#ef4444' },
  ];

  return {
    stats: {
      totalLeads,
      interestedLeads,
      convertedLeads,
      notInterestedLeads,
      totalEmployees,
      conversionRate:
        totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100 * 10) / 10 : 0,
    },
    statusDistribution,
    leadsPerMonth,
    employeePerformance,
  };
}

async function getLeadsPerMonth() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const leads = await prisma.lead.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true, status: true },
  });

  const monthMap = new Map<string, { month: string; total: number; converted: number }>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthMap.set(key, { month: label, total: 0, converted: 0 });
  }

  for (const lead of leads) {
    const key = `${lead.createdAt.getFullYear()}-${String(lead.createdAt.getMonth() + 1).padStart(2, '0')}`;
    const entry = monthMap.get(key);
    if (entry) {
      entry.total += 1;
      if (lead.status === LeadStatus.CONVERTED) entry.converted += 1;
    }
  }

  return Array.from(monthMap.values());
}

async function getEmployeePerformance() {
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      assignedLeads: {
        select: { status: true },
      },
    },
  });

  return employees
    .map((emp) => {
      const total = emp.assignedLeads.length;
      const converted = emp.assignedLeads.filter((l) => l.status === LeadStatus.CONVERTED).length;
      const interested = emp.assignedLeads.filter((l) => l.status === LeadStatus.INTERESTED).length;
      const conversionRate = total > 0 ? Math.round((converted / total) * 100 * 10) / 10 : 0;

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        isActive: emp.isActive,
        totalLeads: total,
        convertedLeads: converted,
        interestedLeads: interested,
        conversionRate,
      };
    })
    .sort((a, b) => b.conversionRate - a.conversionRate);
}

export async function getEmployeeDashboardService(employeeId: string) {
  const [totalLeads, interestedLeads, convertedLeads, notInterestedLeads, recentLeads] =
    await Promise.all([
      prisma.lead.count({ where: { assignedToId: employeeId } }),
      prisma.lead.count({ where: { assignedToId: employeeId, status: LeadStatus.INTERESTED } }),
      prisma.lead.count({ where: { assignedToId: employeeId, status: LeadStatus.CONVERTED } }),
      prisma.lead.count({ where: { assignedToId: employeeId, status: LeadStatus.NOT_INTERESTED } }),
      prisma.lead.findMany({
        where: { assignedToId: employeeId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          phone: true,
          status: true,
          source: true,
          updatedAt: true,
        },
      }),
    ]);

  const statusDistribution = [
    { status: 'Interested', count: interestedLeads, color: '#3b82f6' },
    { status: 'Converted', count: convertedLeads, color: '#22c55e' },
    { status: 'Not Interested', count: notInterestedLeads, color: '#ef4444' },
  ];

  const conversionRate =
    totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100 * 10) / 10 : 0;

  return {
    stats: {
      totalLeads,
      interestedLeads,
      convertedLeads,
      notInterestedLeads,
      conversionRate,
    },
    statusDistribution,
    recentLeads,
  };
}
