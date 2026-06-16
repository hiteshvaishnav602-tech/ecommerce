import { FiStar } from 'react-icons/fi'

export default function StarRating({ rating = 0, size = 16, showCount = false, count = 0, editable = false, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={editable ? 'button' : undefined}
            onClick={editable ? () => onChange?.(star) : undefined}
            className={`${editable ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            disabled={!editable}
          >
            <FiStar
              size={size}
              className={`transition-colors ${
                star <= Math.round(rating)
                  ? 'text-yellow-400'
                  : 'text-dark-600'
              }`}
              fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>
      {rating > 0 && <span className="text-yellow-400 font-semibold text-sm">{rating.toFixed(1)}</span>}
      {showCount && count > 0 && (
        <span className="text-dark-400 text-sm">({count} reviews)</span>
      )}
    </div>
  )
}
