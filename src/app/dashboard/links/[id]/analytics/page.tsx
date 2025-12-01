"use client";

import { useEffect, useState, use } from "react";
import LoadingSkeleton from "./loading";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ArrowLeft, MousePointer2, Globe, Smartphone } from "lucide-react";
import Link from "next/link";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
type AnalyticsData = {
  totalClicks: number;
  chartData: Record<string, number>;
  devices: {
    device: string;
    _count: { id: number };
  }[];
  referrers: {
    referrer: string;
    _count: { id: number };
  }[];
  locations: {
    country: string;
    _count: { id: number };
  }[];
};

export default function AnalyticsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const [data, setData] = useState<AnalyticsData | null>(null);
  // Tambahkan state loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true); // Mulai loading
      try {
        const res = await fetch(`/api/analytics/${params.id}`);
        if (!res.ok) throw new Error("Gagal mengambil data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!data)
    return (
      <div className="p-8 text-center text-white">Data tidak ditemukan.</div>
    );

  const chartData = Object.entries(data.chartData || {}).map(
    ([date, clicks]) => ({
      date,
      clicks,
    })
  );

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-white/10 rounded-full transition text-white/70 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Analitik Link</h1>
            <p className="text-white/50 text-sm">
              Statistik lengkap untuk link Anda
            </p>
          </div>
        </div>

        {/* Ringkasan Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<MousePointer2 className="text-blue-600" />}
            label="Total Klik"
            value={data.totalClicks}
          />
          <StatCard
            icon={<Globe className="text-green-600" />}
            label="Negara Terbanyak"
            value={data.locations?.[0]?.country || "-"}
          />
          <StatCard
            icon={<Smartphone className="text-purple-600" />}
            label="Device Top"
            value={data.devices?.[0]?.device || "-"}
          />
        </div>

        {/* Grafik Harian */}
        <div className="bg-[#111] p-6 rounded-xl border border-white/10 shadow-lg">
          <h3 className="text-lg font-semibold mb-6 text-white">
            Aktivitas 7 Hari Terakhir
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "white" }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                />
                <YAxis tick={{ fill: "white" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(0,0,0,0.8)",
                    color: "white",
                  }}
                />
                <Bar
                  dataKey="clicks"
                  fill="#F5D547"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Device Chart */}
          <div className="bg-[#111] p-6 rounded-xl border border-white/10 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Perangkat Pengguna
            </h3>
            <div className="h-[250px] w-full flex justify-center">
              {data.devices?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.devices}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="_count.id"
                    >
                      {data.devices.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-white/40 self-center">Belum ada data</p>
              )}
            </div>
            {/* Legend Manual */}
            <div className="flex flex-wrap gap-4 justify-center mt-4 text-xs text-white/70">
              {data.devices.map((entry, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span className="capitalize">
                    {entry.device || "Unknown"} ({entry._count.id})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Referrer List */}
          <div className="bg-[#111] p-6 rounded-xl border border-white/10 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Sumber Trafik (Referrer)
            </h3>
            <div className="space-y-4">
              {data.referrers?.length > 0 ? (
                data.referrers.map((ref, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/10"
                  >
                    <span className="text-sm font-medium text-white/80 truncate max-w-[200px]">
                      {ref.referrer || "Langsung (Direct)"}
                    </span>
                    <span className="text-sm font-bold bg-black/50 px-2 py-1 rounded border border-white/10">
                      {ref._count.id} klik
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-white/40 text-center py-10">
                  Belum ada data referer
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-[#111] p-6 rounded-xl border border-white/10 flex items-center gap-4">
      <div className="p-3 bg-black/40 rounded-full border border-white/10 text-[#F5D547]">
        {icon}
      </div>
      <div>
        <p className="text-white/50 text-xs uppercase font-semibold tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold text-white capitalize">{value}</p>
      </div>
    </div>
  );
}
