import { SavingsRecord } from './savingsSlice'; // Adjust the path as needed

export class SavingsService {
  static async list(sort?: string, limit?: number): Promise<SavingsRecord[]> {
    // Simulate an API call (replace with actual fetch logic)
    const response = await fetch('https://your-api-endpoint/savings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed (e.g., token)
      },
    });
    if (!response.ok) throw new Error('Failed to fetch savings');
    const data = await response.json();

    // Apply sorting and limiting (example implementation)
    let sortedData = [...data];
    if (sort) {
      sortedData.sort((a, b) => {
        const aValue = a[sort.replace('-', '')] || '';
        const bValue = b[sort.replace('-', '')] || '';
        return sort.startsWith('-') ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      });
    }
    if (limit) {
      sortedData = sortedData.slice(0, limit);
    }

    return sortedData.map(saving => ({
      id: saving.id,
      amount: saving.amount || 0,
      description: saving.description,
      month: saving.month,
    }));
  }
}

export default SavingsService;