import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-lg text-gray-600">ページが見つかりませんでした</p>
        <Link
          href="/"
          className="inline-block rounded-md bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
