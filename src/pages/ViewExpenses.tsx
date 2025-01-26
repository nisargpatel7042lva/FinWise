import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  bill_images: string[]; // URLs for the images
  created_at: string;
}

export default function ViewExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setExpenses(data || []);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user]);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={handleBack} className="text-blue-600 hover:text-blue-800 mb-6">
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Expenses</h1>

        {loading ? (
          <p>Loading...</p>
        ) : expenses.length === 0 ? (
          <p>No expenses found.</p>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="p-4 bg-white rounded-lg shadow-md">
                <h2 className="text-lg font-semibold">{expense.category}</h2>
                <p>₹{expense.amount}</p>
                <p>{expense.description}</p>
                <p className="text-sm text-gray-500">
                  Added on: {new Date(expense.created_at).toLocaleString()}
                </p>

                {expense.bill_images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {expense.bill_images.map((url, index) => (
                      <img
                        key={index}
                        src={`${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/${url}`}
                        alt={`Bill ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
