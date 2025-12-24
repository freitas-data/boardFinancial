"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SectionChart = {
  name: string;
  actualPct: number;
  targetPct: number;
  totalValue: number;
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--sky))",
  "hsl(var(--amber))",
  "hsl(var(--muted-foreground))"
];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

export function ReportCharts({ sections }: { sections: SectionChart[] }) {
  if (!sections.length) {
    return (
      <Card className="bg-[hsl(var(--card))] shadow-xl shadow-black/25">
        <CardHeader>
          <CardTitle>Distribuição por seção</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Nenhuma seção cadastrada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="bg-[hsl(var(--card))] shadow-xl shadow-black/25">
        <CardHeader>
          <CardTitle>Distribuição atual por seção</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={sections}
                dataKey="actualPct"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                cornerRadius={6}
              >
                {sections.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0]?.payload as SectionChart;
                  return (
                    <div className="rounded-lg border border-border/70 bg-[hsl(var(--card))] px-3 py-2 text-xs text-[hsl(var(--foreground))] shadow-lg">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-[hsl(var(--muted-foreground))]">
                        {data.actualPct.toFixed(2)}% • {currency.format(data.totalValue)}
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-[hsl(var(--card))] shadow-xl shadow-black/25">
        <CardHeader>
          <CardTitle>Meta vs. atual</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer>
            <BarChart data={sections} margin={{ left: -8, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--card))",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: number | string, name: string) => {
                  const numeric = typeof value === "number" ? value : Number(value);
                  return [`${Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00"}%`, name];
                }}
              />
              <Legend />
              <Bar dataKey="targetPct" name="Meta" fill="hsl(var(--muted-foreground))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="actualPct" name="Atual" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
