interface Props {
  note: number
  max?: number
  taille?: number
}

export default function EtoilesDisplay({ note, max = 5, taille = 16 }: Props) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${note} sur ${max} étoiles`}>
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          width={taille}
          height={taille}
          viewBox="0 0 24 24"
          fill={i < note ? '#D27D56' : 'none'}
          stroke={i < note ? '#D27D56' : '#ddd8cc'}
          strokeWidth="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}
