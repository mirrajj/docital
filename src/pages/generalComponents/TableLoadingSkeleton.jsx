

const TableLoading = ({ error, retryCount, maxRetries, handleRetry, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="space-y-4">
          {/* Header shimmer */}
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="h-px w-full bg-gray-200 my-4"></div>
          
          {/* Table header shimmer */}
          <div className="flex w-full bg-gray-100 rounded-lg p-3">
            <div className="w-1/6 h-5 bg-gray-200 rounded animate-pulse mr-2"></div>
            <div className="w-1/6 h-5 bg-gray-200 rounded animate-pulse mr-2"></div>
            <div className="w-1/6 h-5 bg-gray-200 rounded animate-pulse mr-2"></div>
            <div className="w-1/6 h-5 bg-gray-200 rounded animate-pulse mr-2"></div>
            <div className="w-1/6 h-5 bg-gray-200 rounded animate-pulse mr-2"></div>
            <div className="w-1/6 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {/* Table rows shimmer - create 5 skeleton rows */}
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex w-full py-4 border-b border-gray-100 animate-pulse" 
                style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="w-1/6 h-4 bg-gray-200 rounded mr-2"></div>
              <div className="w-1/6 h-4 bg-gray-200 rounded mr-2"></div>
              <div className="w-1/6 h-4 bg-gray-200 rounded mr-2"></div>
              <div className="w-1/6 h-4 bg-gray-200 rounded mr-2"></div>
              <div className="w-1/6 h-4 bg-gray-200 rounded mr-2 flex justify-center">
                <div className="w-8 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="w-1/6 h-4 flex space-x-2 justify-center">
                <div className="w-6 h-4 bg-gray-200 rounded-full"></div>
                <div className="w-6 h-4 bg-gray-200 rounded-full"></div>
                <div className="w-6 h-4 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-center items-center pt-4">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm text-gray-600">Loading tasks...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Failed to load tasks</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            We encountered a problem while fetching your tasks. This might be due to a network issue or server problem.
          </p>
          
          {retryCount < maxRetries ? (
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry ({retryCount}/{maxRetries})
            </button>
          ) : (
            <div className="text-amber-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Maximum retries reached. Please refresh the page or try again later.</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return null;
};
export default TableLoading;