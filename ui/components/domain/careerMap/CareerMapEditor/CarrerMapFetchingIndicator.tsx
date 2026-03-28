import Spinner from "@/ui/components/basic/Spinner"

type CarrerMapFetchingIndicatorProps = {
  visible: boolean
}

export default function CarrerMapFetchingIndicator({ visible }: CarrerMapFetchingIndicatorProps) {
  if (!visible) return null

  return (
    <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-md bg-white/90 px-3 py-2 shadow-sm text-sm text-gray-600">
      <Spinner size="small" />
      <span>データ取得中...</span>
    </div>
  )
}
