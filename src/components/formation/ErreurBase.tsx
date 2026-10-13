// Bandeau affiché quand la base de données n'a pas pu être lue.
export function ErreurBase({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="mx-auto mt-4 max-w-6xl px-4">
      <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
        ⚠️ La base de données n’a pas pu être lue, le contenu affiché est celui de départ. Cause : {message}
      </div>
    </div>
  )
}
