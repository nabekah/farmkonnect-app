import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

interface Worker {
  id: number;
  name: string;
  role: string;
  farmId: number;
}

interface WorkerSelectorProps {
  farmId: number;
  onWorkerSelect: (workerId: number, workerName: string) => void;
  selectedWorkerId?: number;
}

export const WorkerSelector = ({ farmId, onWorkerSelect, selectedWorkerId }: WorkerSelectorProps) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the tRPC query to fetch workers
        const result = await trpc.workforce.workers.list.query({ farmId });
        
        if (Array.isArray(result)) {
          setWorkers(result);
        } else {
          setWorkers([]);
          setError('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching workers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch workers');
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    };

    if (farmId) {
      fetchWorkers();
    }
  }, [farmId]);

  return (
    <div className="w-full">
      <select
        value={selectedWorkerId || ''}
        onChange={(e) => {
          const workerId = parseInt(e.target.value);
          const worker = workers.find(w => w.id === workerId);
          if (worker) {
            onWorkerSelect(workerId, worker.name);
          }
        }}
        disabled={loading || workers.length === 0}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">
          {loading ? 'Loading workers...' : workers.length === 0 ? 'No workers available' : 'Select Worker'}
        </option>
        {workers.map((worker) => (
          <option key={worker.id} value={worker.id}>
            {worker.name} ({worker.role})
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};
