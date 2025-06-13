export default function PropertiesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-6"></div>

      {/* Search and Filter Section Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-grow h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Properties Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="h-48 bg-gray-200 animate-pulse"></div>
            <div className="p-4">
              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
