/**
 * TableDrawSkeleton — lignes squelette animées pendant le chargement.
 * Les largeurs alternent de façon déterministe pour éviter les re-renders aléatoires.
 */

const WIDTHS = ["w-1/2", "w-3/4", "w-2/3", "w-5/6", "w-1/3", "w-2/5", "w-3/5", "w-4/5"];

export default function TableDrawSkeleton({ columnCount = 4, rowCount = 6, compact = false }) {
  const cell = compact ? "px-4 py-2" : "px-4 py-3.5";

  return (
    <>
      {Array.from({ length: rowCount }).map((_, ri) => (
        <tr key={ri} className="border-b border-gray-700/50">
          {Array.from({ length: columnCount }).map((_, ci) => (
            <td key={ci} className={cell}>
              <div
                className={`h-3 bg-gray-700 rounded-full animate-pulse ${
                  WIDTHS[(ri * columnCount + ci) % WIDTHS.length]
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
