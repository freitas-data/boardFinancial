"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";

type SectionChartData = {
  name: string;
  value: number;
};

const COLORS = ["#3A7BFF", "#4CD1B0", "#F8CBA6", "#5FB4FF"];

export function SectionsChart({ data }: { data: SectionChartData[] }) {
  if (!data.length) {
    return <p className="text-sm text-[hsl(var(--muted-foreground))]">Nenhuma seção definida ainda.</p>;
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            cornerRadius={6}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--card))",
              color: "hsl(var(--foreground))"
            }}
            formatter={(value: number, name: string) => [`${value}%`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
