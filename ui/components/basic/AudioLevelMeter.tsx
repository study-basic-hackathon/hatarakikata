type Props = {
  levels: number[]
}

export default function AudioLevelMeter({ levels }: Props) {
  return (
    <div className="flex h-6 items-end gap-px">
      {levels.map((level, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-red-400"
          style={{
            height: `${Math.max(8, level * 100)}%`,
            transition: "height 80ms ease-out",
          }}
        />
      ))}
    </div>
  )
}
