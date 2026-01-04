"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface OverviewChartProps {
    data: {
        date: string
        views: number
    }[]
}

export function OverviewChart({ data }: OverviewChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                    contentStyle={{ background: "#333", border: "none", color: "#fff" }}
                    cursor={{ fill: "transparent" }}
                />
                <Bar dataKey="views" fill="#adfa1d" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}
