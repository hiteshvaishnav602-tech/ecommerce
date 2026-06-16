export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[3/4] w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="flex items-center gap-2">
          <div className="skeleton h-5 w-20 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      </div>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="skeleton aspect-square rounded-2xl" />
      <div className="space-y-4">
        <div className="skeleton h-8 w-3/4 rounded" />
        <div className="skeleton h-6 w-1/2 rounded" />
        <div className="skeleton h-20 w-full rounded" />
        <div className="flex gap-3">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-10 w-16 rounded-xl" />)}
        </div>
        <div className="skeleton h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function BannerSkeleton() {
  return <div className="skeleton w-full h-64 md:h-96 rounded-2xl" />
}

export function CategorySkeleton() {
  return (
    <div className="flex gap-4">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="flex-shrink-0 w-24">
          <div className="skeleton w-24 h-24 rounded-2xl mb-2" />
          <div className="skeleton h-3 w-16 rounded mx-auto" />
        </div>
      ))}
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="skeleton h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  )
}

export default function Skeleton({ className = '', rounded = 'rounded-lg' }) {
  return <div className={`skeleton ${rounded} ${className}`} />
}
