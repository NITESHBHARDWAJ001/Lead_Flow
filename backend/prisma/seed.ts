import { PrismaClient, Role, LeadStatus, LeadSource } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Create admin
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@leadflow.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@leadflow.com',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // Create employees
  const emp1Password = await bcrypt.hash('Employee@123', 12);
  const employee1 = await prisma.user.upsert({
    where: { email: 'john@leadflow.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@leadflow.com',
      password: emp1Password,
      role: Role.EMPLOYEE,
      isActive: true,
    },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'jane@leadflow.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@leadflow.com',
      password: emp1Password,
      role: Role.EMPLOYEE,
      isActive: true,
    },
  });

  const employee3 = await prisma.user.upsert({
    where: { email: 'mike@leadflow.com' },
    update: {},
    create: {
      name: 'Mike Johnson',
      email: 'mike@leadflow.com',
      password: emp1Password,
      role: Role.EMPLOYEE,
      isActive: true,
    },
  });

  // Create sample leads
  const leadsData = [
    { name: 'Alice Brown', phone: '+1-555-0101', email: 'alice@example.com', source: LeadSource.CALL, status: LeadStatus.INTERESTED, assignedToId: employee1.id },
    { name: 'Bob Wilson', phone: '+1-555-0102', email: 'bob@example.com', source: LeadSource.WHATSAPP, status: LeadStatus.CONVERTED, assignedToId: employee1.id },
    { name: 'Carol Davis', phone: '+1-555-0103', email: 'carol@example.com', source: LeadSource.FIELD, status: LeadStatus.NOT_INTERESTED, assignedToId: employee1.id },
    { name: 'David Miller', phone: '+1-555-0104', email: 'david@example.com', source: LeadSource.CALL, status: LeadStatus.INTERESTED, assignedToId: employee2.id },
    { name: 'Eva Garcia', phone: '+1-555-0105', email: 'eva@example.com', source: LeadSource.WHATSAPP, status: LeadStatus.CONVERTED, assignedToId: employee2.id },
    { name: 'Frank Lee', phone: '+1-555-0106', source: LeadSource.FIELD, status: LeadStatus.INTERESTED, assignedToId: employee2.id },
    { name: 'Grace Chen', phone: '+1-555-0107', email: 'grace@example.com', source: LeadSource.CALL, status: LeadStatus.CONVERTED, assignedToId: employee3.id },
    { name: 'Henry Taylor', phone: '+1-555-0108', source: LeadSource.WHATSAPP, status: LeadStatus.INTERESTED, assignedToId: employee3.id },
    { name: 'Iris Martinez', phone: '+1-555-0109', email: 'iris@example.com', source: LeadSource.FIELD, status: LeadStatus.NOT_INTERESTED, assignedToId: employee3.id },
    { name: 'Jack Anderson', phone: '+1-555-0110', email: 'jack@example.com', source: LeadSource.CALL, status: LeadStatus.CONVERTED, assignedToId: employee1.id },
  ];

  for (const lead of leadsData) {
    const existingLead = await prisma.lead.findFirst({ where: { phone: lead.phone } });
    if (!existingLead) {
      const createdLead = await prisma.lead.create({
        data: {
          ...lead,
          createdById: admin.id,
          notes: `Sample lead created for ${lead.name}`,
        },
      });

      await prisma.leadStatusHistory.create({
        data: {
          leadId: createdLead.id,
          newStatus: lead.status,
          changedById: admin.id,
        },
      });
    }
  }

  console.log('✅ Seeding complete!');
  console.log('');
  console.log('🔐 Test credentials:');
  console.log('  Admin:    admin@leadflow.com    / Admin@123');
  console.log('  Employee: john@leadflow.com     / Employee@123');
  console.log('  Employee: jane@leadflow.com     / Employee@123');
  console.log('  Employee: mike@leadflow.com     / Employee@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
