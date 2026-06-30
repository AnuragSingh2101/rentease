"use client";

import * as React from "react";

interface RevenueData {
  month: string;
  Revenue: number;
  Rentals: number;
}

interface UserDistributionData {
  name: string;
  value: number;
}

interface ProductUtilizationData {
  category: string;
  Rented: number;
  Total: number;
  Utilization: number;
}

export function RevenueChart({ data }: { data: RevenueData[] }) {
  const [recharts, setRecharts] = React.useState<any>(null);

  React.useEffect(() => {
    import("recharts").then(setRecharts);
  }, []);

  if (!recharts) {
    return <div className="h-72 w-full flex items-center justify-center text-xs text-neutral-400 font-semibold">Loading charts...</div>;
  }

  const {
    LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
  } = recharts;

  return (
    <div className="h-72 w-full text-xs font-semibold">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:hidden" />
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" className="hidden dark:block" />
          <XAxis dataKey="month" stroke="#888888" fontSize={10} tickLine={false} />
          <YAxis yAxisId="left" stroke="#6366f1" fontSize={10} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={10} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#171717",
              border: "none",
              borderRadius: "12px",
              color: "#ffffff"
            }}
          />
          <Legend wrapperStyle={{ paddingTop: "10px" }} />
          <Line yAxisId="left" type="monotone" dataKey="Revenue" name="Revenue (₹)" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line yAxisId="right" type="monotone" dataKey="Rentals" name="Contracts Count" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const PIE_COLORS = ["#3b82f6", "#10b981", "#a855f7"];

export function RolesChart({ data }: { data: UserDistributionData[] }) {
  const [recharts, setRecharts] = React.useState<any>(null);

  React.useEffect(() => {
    import("recharts").then(setRecharts);
  }, []);

  if (!recharts) {
    return <div className="h-48 w-full flex items-center justify-center text-xs text-neutral-400 font-semibold">Loading distribution...</div>;
  }

  const {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer
  } = recharts;

  return (
    <div className="h-48 w-full flex items-center justify-center text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function UtilizationChart({ data }: { data: ProductUtilizationData[] }) {
  const [recharts, setRecharts] = React.useState<any>(null);

  React.useEffect(() => {
    import("recharts").then(setRecharts);
  }, []);

  if (!recharts) {
    return <div className="h-72 w-full flex items-center justify-center text-xs text-neutral-400 font-semibold">Loading utilization...</div>;
  }

  const {
    BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
  } = recharts;

  return (
    <div className="h-72 w-full text-xs font-semibold">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:hidden" />
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" className="hidden dark:block" />
          <XAxis dataKey="category" stroke="#888888" fontSize={10} tickLine={false} />
          <YAxis stroke="#888888" fontSize={10} tickLine={false} label={{ value: 'Utilization (%)', angle: -90, position: 'insideLeft', offset: 5 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#171717",
              border: "none",
              borderRadius: "12px",
              color: "#ffffff"
            }}
          />
          <Legend wrapperStyle={{ paddingTop: "10px" }} />
          <Bar dataKey="Utilization" name="Utilization Rate (%)" fill="#10b981" radius={[8, 8, 0, 0]}>
            {data.map((entry) => (
              <Cell key={`cell-${entry.category}`} fill={entry.Utilization > 50 ? "#3b82f6" : "#10b981"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}