import { prisma } from "@/lib/prisma/prisma";
import { AdminCompaniesTable } from "@/components/admin/admin-companies-table";

interface CompaniesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    industry?: string;
  }>;
}

export default async function AdminCompaniesPage({
  searchParams,
}: CompaniesPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const perPage = 10;
  const search = params.search || "";
  const industryFilter = params.industry || "";

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (industryFilter) {
    where.industry = industryFilter;
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
      },
    }),
    prisma.company.count({ where }),
  ]);

  // Get product counts for each company
  const companyIds = companies.map((c) => c.userId);
  const productCounts = await prisma.product.groupBy({
    by: ["userId"],
    where: { userId: { in: companyIds } },
    _count: true,
    _sum: { quantity: true },
  });

  const productCountMap = new Map(
    productCounts.map((p) => [
      p.userId,
      { count: p._count, units: p._sum.quantity || 0 },
    ])
  );

  const companiesWithStats = companies.map((company) => ({
    ...company,
    productCount: productCountMap.get(company.userId)?.count || 0,
    totalUnits: productCountMap.get(company.userId)?.units || 0,
  }));

  const totalPages = Math.ceil(total / perPage);

  // Get unique industries for filter
  const industries = await prisma.company.findMany({
    where: { industry: { not: null } },
    select: { industry: true },
    distinct: ["industry"],
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Company Management</h1>
        <p className="text-muted-foreground">
          View and manage all companies on the platform
        </p>
      </div>

      <AdminCompaniesTable
        companies={companiesWithStats}
        page={page}
        totalPages={totalPages}
        total={total}
        search={search}
        industryFilter={industryFilter}
        industries={
          industries.map((i) => i.industry).filter(Boolean) as string[]
        }
      />
    </div>
  );
}
