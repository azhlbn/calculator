'use client';

import { useState } from 'react';

export default function Home() {
  const [inputs, setInputs] = useState({
    lock_size_1: 100,
    lock_size_2: 100,
    lock_size_3: 100,
    lock_size_4: 100,
    lock_size_5: 100,
    total_tokens: 1000,
  });

  const [results, setResults] = useState<{
    users: Array<{ user: string; lockSize: number; reward: number }>;
    total_locked_tokens: number;
    total_rewards: number;
  } | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  const computeShardsRewards = () => {
    const base_shards = 100;
    const lock_sizes = [
      inputs.lock_size_1,
      inputs.lock_size_2,
      inputs.lock_size_3,
      inputs.lock_size_4,
      inputs.lock_size_5,
    ];

    // Validation checks
    if (inputs.total_tokens <= 0) {
      setError("Total Tokens must be > 0");
      setResults(null);
      return;
    }

    if (lock_sizes.some(size => size < 0)) {
      setError("Lock sizes must be non-negative");
      setResults(null);
      return;
    }

    const total_locked_tokens = lock_sizes.reduce((a, b) => a + b, 0);
    
    if (total_locked_tokens > inputs.total_tokens) {
      setError(`Invalid parameters: Total locked tokens (${total_locked_tokens}) cannot exceed total supply (${inputs.total_tokens})`);
      setResults(null);
      return;
    }

    if (total_locked_tokens === 0) {
      setError("Total Locked Tokens must be > 0");
      setResults(null);
      return;
    }

    // Calculate rewards
    const max_lock_size = Math.max(...lock_sizes);
    const decentralization_factor = 1 - max_lock_size / total_locked_tokens;
    
    const rewards = lock_sizes.map(lock_size => 
      base_shards * 
      (lock_size / inputs.total_tokens) * 
      Math.sqrt(total_locked_tokens / inputs.total_tokens) * 
      decentralization_factor
    );

    const total_rewards = rewards.reduce((a, b) => a + b, 0);

    setResults({
      users: lock_sizes.map((size, i) => ({
        user: `User ${i + 1}`,
        lockSize: size,
        reward: rewards[i],
      })),
      total_locked_tokens,
      total_rewards,
    });
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-5 flex items-center justify-center text-gray-100">
      <div className="bg-gray-800/95 rounded-3xl border border-white/10 p-10 w-full max-w-3xl shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-center mb-8">Shards Rewards Calculator</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="mb-4">
              <label className="block text-gray-400 mb-2">Lock Size User {i}:</label>
              <input
                type="number"
                name={`lock_size_${i}`}
                value={inputs[`lock_size_${i}` as keyof typeof inputs]}
                onChange={handleInputChange}
                className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-gray-100"
              />
            </div>
          ))}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Total Supply:</label>
            <input
              type="number"
              name="total_tokens"
              value={inputs.total_tokens}
              onChange={handleInputChange}
              className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-gray-100"
            />
          </div>
        </div>

        <button
          onClick={computeShardsRewards}
          className="w-full py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg font-bold text-gray-900 hover:opacity-90 transition-opacity"
        >
          Calculate Rewards
        </button>

        {error && (
          <div className="text-red-400 text-center mt-4">
            {error}
          </div>
        )}

        {results && (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-left bg-white/10 border border-white/10">User</th>
                  <th className="p-3 text-left bg-white/10 border border-white/10">Lock Size</th>
                  <th className="p-3 text-left bg-white/10 border border-white/10">Shards Reward</th>
                </tr>
              </thead>
              <tbody>
                {results.users.map((user, i) => (
                  <tr key={i}>
                    <td className="p-3 border border-white/10">{user.user}</td>
                    <td className="p-3 border border-white/10">{user.lockSize.toFixed(2)}</td>
                    <td className="p-3 border border-white/10">{user.reward.toFixed(4)}</td>
                  </tr>
                ))}
                <tr className="font-bold bg-white/5">
                  <td className="p-3 border border-white/10">Total</td>
                  <td className="p-3 border border-white/10">{results.total_locked_tokens.toFixed(2)}</td>
                  <td className="p-3 border border-white/10">{results.total_rewards.toFixed(4)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
