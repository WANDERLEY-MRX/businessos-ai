'use client'

interface ChartData {
  label: string
  value: number
}

interface ChartProps {
  data: ChartData[]
  height?: number
}

export function Chart({ data, height = 200 }: ChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="w-full">
      <div
        className="flex items-end gap-2 w-full"
        style={{ height: `${height}px` }}
      >
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100
          return (
            <div
              key={index}
              className="flex flex-col items-center flex-1 h-full justify-end"
            >
              <span className="text-xs font-semibold text-gray-700 mb-1">
                {item.value}
              </span>
              <div
                className="w-full rounded-t-md bg-violet-500 transition-all duration-300"
                style={{ height: `${barHeight}%`, minHeight: item.value > 0 ? '4px' : '0' }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-2 mt-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center">
            <span className="text-xs text-gray-500 truncate block">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
