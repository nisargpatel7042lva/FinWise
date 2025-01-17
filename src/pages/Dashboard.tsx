import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  LogOut, 
  Eye, 
  AlertCircle, 
  X, 
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Coffee,
  Car,
  Home,
  ShoppingBag,
  Gamepad2,
  MoreHorizontal,
  Wallet,
  Edit2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  bill_images?: string[];
  created_at: string;
}

interface Profile {
  id: string;
  username: string;
  savings_goal: number;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'food':
      return <Coffee className="h-5 w-5" />;
    case 'transport':
      return <Car className="h-5 w-5" />;
    case 'utilities':
      return <Home className="h-5 w-5" />;
    case 'shopping':
      return <ShoppingBag className="h-5 w-5" />;
    case 'entertainment':
      return <Gamepad2 className="h-5 w-5" />;
    default:
      return <MoreHorizontal className="h-5 w-5" />;
  }
};

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageLoading, setImageLoading] = useState(true);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchProfile();
    }
  }, [user]);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newGoal) return;

    setIsUpdatingGoal(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ savings_goal: parseFloat(newGoal) })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, savings_goal: parseFloat(newGoal) } : null);
      setIsEditingGoal(false);
      setNewGoal('');
    } catch (error) {
      console.error('Error updating goal:', error);
    } finally {
      setIsUpdatingGoal(false);
    }
  };

  const handleNextImage = () => {
    if (selectedExpense?.bill_images) {
      setCurrentImageIndex((prev) => 
        prev === selectedExpense.bill_images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (selectedExpense?.bill_images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedExpense.bill_images!.length - 1 : prev - 1
      );
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setZoomLevel(1);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = profile ? profile.savings_goal - totalExpenses : 0;
  const progressPercentage = profile ? (totalExpenses / profile.savings_goal) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Wallet className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">FinWise</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/add-expense')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Add Expense</span>
            </button>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Monthly Goal</h2>
              <button
                onClick={() => {
                  setNewGoal(profile?.savings_goal.toString() || '');
                  setIsEditingGoal(true);
                }}
                className="text-blue-600 hover:text-blue-700 transform hover:scale-110 transition-transform duration-200"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{profile?.savings_goal.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Total Expenses</h2>
            <p className="text-3xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Remaining Budget</h2>
            <p className={`text-3xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{remainingBudget.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Progress</h2>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className={`h-4 rounded-full ${
                progressPercentage > 100 ? 'bg-red-600' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {progressPercentage > 100 ? (
              <span className="text-red-600">
                <AlertCircle className="inline h-4 w-4 mr-1" />
                You've exceeded your monthly budget!
              </span>
            ) : (
              `${Math.round(progressPercentage)}% of monthly budget used`
            )}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Expenses</h2>
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{expense.description || expense.category}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(expense.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="font-semibold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                    {expense.bill_images && expense.bill_images.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedExpense(expense);
                          setCurrentImageIndex(0);
                          setZoomLevel(1);
                          setImageLoading(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedExpense && (
          <div className={`fixed inset-0 bg-black ${isFullscreen ? '' : 'bg-opacity-50'} flex items-center justify-center z-50`}>
            <div className={`bg-white rounded-lg ${isFullscreen ? 'w-full h-full' : 'w-full max-w-4xl p-6'}`}>
              <div className="flex justify-between items-center mb-6 p-4">
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Bill Images ({currentImageIndex + 1}/{selectedExpense.bill_images?.length})
                  </h2>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleZoomOut}
                    className="text-gray-600 hover:text-gray-900 p-2"
                    disabled={zoomLevel <= 0.5}
                  >
                    <ZoomOut className="h-5 w-5" />
                  </button>
                  <span className="text-gray-600">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={handleZoomIn}
                    className="text-gray-600 hover:text-gray-900 p-2"
                    disabled={zoomLevel >= 3}
                  >
                    <ZoomIn className="h-5 w-5" />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="text-gray-600 hover:text-gray-900 p-2"
                  >
                    {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedExpense(null);
                      setCurrentImageIndex(0);
                      setZoomLevel(1);
                      setIsFullscreen(false);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className={`relative ${isFullscreen ? 'h-[calc(100vh-100px)]' : 'h-[60vh]'} overflow-hidden`}>
                {selectedExpense.bill_images && selectedExpense.bill_images.length > 0 && (
                  <>
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/bills/${selectedExpense.bill_images[currentImageIndex]}`}
                      alt={`Bill ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain transition-transform duration-200 ease-in-out"
                      style={{ transform: `scale(${zoomLevel})` }}
                      onLoad={() => setImageLoading(false)}
                    />
                    {selectedExpense.bill_images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                        >
                          <ChevronLeft className="h-6 w-6 text-gray-600" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                        >
                          <ChevronRight className="h-6 w-6 text-gray-600" />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>

              {selectedExpense.bill_images && selectedExpense.bill_images.length > 1 && (
                <div className="mt-4 px-4">
                  <div className="flex justify-center space-x-2">
                    {selectedExpense.bill_images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          currentImageIndex === index ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Monthly Goal Edit Modal */}
        {isEditingGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Set Monthly Goal</h2>
                <button
                  onClick={() => setIsEditingGoal(false)}
                  className="text-gray-500 hover:text-gray-700 transform hover:scale-110 transition-transform duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateGoal} className="space-y-6">
                <div>
                  <label htmlFor="monthlyGoal" className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Savings Goal (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      id="monthlyGoal"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      min="0"
                      step="100"
                      required
                      className="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your monthly goal"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditingGoal(false)}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingGoal}
                    className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingGoal ? 'Updating...' : 'Update Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}