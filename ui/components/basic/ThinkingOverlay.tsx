export default function ThinkingOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/80 backdrop-blur-sm">
      <span className="text-5xl animate-bounce">🤖</span>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-foreground/70">AIが考え中</span>
        <span className="inline-flex gap-0.5">
          <span className="size-1.5 rounded-full bg-foreground/50 animate-[pulse_1.4s_ease-in-out_infinite]" />
          <span className="size-1.5 rounded-full bg-foreground/50 animate-[pulse_1.4s_ease-in-out_0.2s_infinite]" />
          <span className="size-1.5 rounded-full bg-foreground/50 animate-[pulse_1.4s_ease-in-out_0.4s_infinite]" />
        </span>
      </div>
    </div>
  )
}
