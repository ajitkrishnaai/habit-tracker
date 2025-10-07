import { Layout, Button } from './components';
import { useHabits } from './hooks/useHabits';
import { formatDisplayDate } from './utils';

function App() {
  const { habits, isLoading, error } = useHabits();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your habits...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-danger-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {formatDisplayDate(new Date())}
          </h2>
          <p className="text-gray-600">
            Track your daily habits and build lasting routines
          </p>
        </div>

        <div className="space-y-4">
          {habits.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No habits yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start building healthy habits by adding your first one
              </p>
              <Button>Add Your First Habit</Button>
            </div>
          ) : (
            habits.map(habit => (
              <div
                key={habit.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {habit.name}
                </h3>
                <div className="flex gap-3">
                  <Button variant="success" size="lg" className="flex-1">
                    Complete Today
                  </Button>
                  <Button variant="secondary" size="lg" className="flex-1">
                    Add Reflection
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

export default App;
