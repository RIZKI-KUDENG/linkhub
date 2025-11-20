import { prisma } from "@/lib/prisma";

export default async function PublicPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await prisma.user.findFirst({
    where: {
      name: username,
    },
    include: {
      links: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold text-slate-600">
          User tidak ditemukan.
        </p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto mt-10">
        {/* Profile Section */}
        <div className="text-center mb-10">
          <div className="relative w-24 h-24 mx-auto mb-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "Profile"}
                className="w-full h-full rounded-full object-cover border-2 border-slate-100 shadow-sm"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                {user.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">@{user.name}</h1>
        </div>
        <div className="space-y-4">
          {user.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group bg-white border border-slate-200 rounded-xl p-1.5 pr-4 hover:border-slate-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                  {link.imageUrl ? (
                    <img
                      src={link.imageUrl}
                      alt={link.title || "Link thumbnail"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <span className="text-xs">No Img</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 py-1">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {link.title || link.url}
                  </h3>
                  {link.description && (
                    <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">
                      {link.description}
                    </p>
                  )}
                </div>
              </div>
            </a>
          ))}

          {user.links.length === 0 && (
            <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed">
              <p>Belum ada link yang ditampilkan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
