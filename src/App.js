import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Trash2, Settings, Home, Calendar, ShoppingCart, Users, Activity, Mail, MessageCircle, Printer, Download, User, ChevronRight, Sparkles, Edit2, X, Check, ChefHat, Flame, Leaf } from 'lucide-react';

export default function MealPlannerApp() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({
    Arun: { name: 'Arun', meals: {}, weeklyPlans: [], preferences: {}, cuisines: [], mealTypes: [] },
    Preeti: { name: 'Preeti', meals: {}, weeklyPlans: [], preferences: {}, cuisines: [], mealTypes: [] },
    Nirav: { name: 'Nirav', meals: {}, weeklyPlans: [], preferences: {}, cuisines: [], mealTypes: [] }
  });
  const [meals, setMeals] = useState({});
  const [userMeals, setUserMeals] = useState({});
  const [weeklyPlans, setWeeklyPlans] = useState({});
  const [newUserName, setNewUserName] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedTastes, setSelectedTastes] = useState([]);
  const [editingMeal, setEditingMeal] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [mealPreference, setMealPreference] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Comprehensive meal database organized by cuisine, meal type, and taste
  const mealDatabase = {
    'Indian - Gujarati': {
      Breakfast: {
        sweet: ['Khaman Dhokla', 'Fafda Jalebi', 'Undhiyu'],
        spicy: ['Thepla', 'Handvo', 'Khichiyu'],
        mild: ['Upma', 'Idli', 'Poha']
      },
      Lunch: {
        sweet: [],
        spicy: ['Fansi Roti Dal Rice', 'Bhindi Roti Dal Rice', 'Parval Roti Dal Rice', 'Bhakri Aloo Shaak'],
        mild: ['Dal Dhokli', 'Khichdi Kadhi Shaak', 'Jacket Potato Coleslaw']
      },
      Dinner: {
        sweet: ['Kheer', 'Halwa'],
        spicy: ['Sev Tameta Rotli', 'Samosa', 'Pav Bhaji', 'Misal Pav'],
        mild: ['Dosa Sambar', 'Idli Sambar', 'Bread Sandwiches', 'Toast Sandwich']
      }
    },
    'Indian - Punjabi': {
      Breakfast: {
        sweet: ['Halwa Puri', 'Gur ke Gujhiye'],
        spicy: ['Aloo Paratha', 'Paneer Paratha', 'Makki Roti'],
        mild: ['Oatmeal', 'Poha', 'Upma']
      },
      Lunch: {
        sweet: [],
        spicy: ['Makhanwala Paratha', 'Palak Paneer Paratha', 'Chicken Tandoori', 'Paneer Butter Masala'],
        mild: ['Rajma Rice', 'Chole Bhature', 'Dal Makhani']
      },
      Dinner: {
        sweet: ['Gulab Jamun', 'Kheer'],
        spicy: ['Tandoori Chicken', 'Butter Chicken', 'Sarson da Saag', 'Chana Masala'],
        mild: ['Dal Makhani', 'Rajma Rice', 'Vegetable Curry']
      }
    },
    'Indian - South Indian': {
      Breakfast: {
        sweet: ['Puttu Kudam', 'Semiya Upma'],
        spicy: ['Idli Sambar', 'Dosa', 'Uttapam'],
        mild: ['Pesarattu', 'Appam', 'Pongal']
      },
      Lunch: {
        sweet: [],
        spicy: ['Rasam Rice', 'Sambhar Rice', 'Curd Rice Lemon'],
        mild: ['Coconut Rice', 'Tamarind Rice', 'Plain Rice Curry']
      },
      Dinner: {
        sweet: ['Payasam', 'Jaggery Pudding'],
        spicy: ['Masala Dosa', 'Chana Dal Dosa', 'Vegetable Kurma'],
        mild: ['Plain Dosa', 'Appam Stew', 'Steamed Rice Cakes']
      }
    },
    'Chinese': {
      Breakfast: {
        sweet: [],
        spicy: ['Chinese Noodles', 'Spring Rolls'],
        mild: ['Steamed Momos', 'Rice Porridge']
      },
      Lunch: {
        sweet: [],
        spicy: ['Chilli Chicken', 'Manchurian', 'Kung Pao Chicken', 'Hakka Noodles'],
        mild: ['Fried Rice', 'Vegetable Noodles', 'Steamed Broccoli']
      },
      Dinner: {
        sweet: ['Fortune Cookies'],
        spicy: ['Chilli Garlic Noodles', 'Sweet Sour Chicken', 'Szechwan Sauce'],
        mild: ['Fried Rice', 'Vegetable Lo Mein', 'Steamed Dumplings']
      }
    },
    'Italian': {
      Breakfast: {
        sweet: ['Panettone', 'Biscotti'],
        spicy: [],
        mild: ['Cappuccino Toast', 'Fruit Salad']
      },
      Lunch: {
        sweet: [],
        spicy: ['Arrabbiata Pasta', 'Spicy Pizza'],
        mild: ['Carbonara Pasta', 'Margherita Pizza', 'Lasagna']
      },
      Dinner: {
        sweet: ['Tiramisu', 'Panna Cotta'],
        spicy: ['Penne Arrabbiata', 'Spicy Risotto'],
        mild: ['Fettuccine Alfredo', 'Ravioli', 'Risotto Milanese']
      }
    },
    'Asian - Other': {
      Breakfast: {
        sweet: ['Thai Sticky Rice'],
        spicy: ['Thai Spiced Eggs', 'Vietnamese Pho'],
        mild: ['Congee', 'Banh Mi Lite']
      },
      Lunch: {
        sweet: [],
        spicy: ['Thai Green Curry', 'Tom Yum Soup', 'Vietnamese Spring Rolls'],
        mild: ['Tom Kha Gai', 'Pad Thai Light', 'Vietnamese Salad']
      },
      Dinner: {
        sweet: ['Mango Sticky Rice'],
        spicy: ['Green Curry', 'Red Curry', 'Spicy Tom Yum'],
        mild: ['Panang Curry', 'Pad See Ew', 'Vietnamese Pho']
      }
    },
    'Continental': {
      Breakfast: {
        sweet: ['Pancakes', 'Croissants'],
        spicy: ['Bacon Eggs', 'Sausage Toast'],
        mild: ['Oatmeal', 'Fruit Salad', 'Toast Sandwich']
      },
      Lunch: {
        sweet: [],
        spicy: ['Burger', 'Grilled Chicken Sandwich', 'Tacos'],
        mild: ['Caesar Salad', 'Sandwich', 'Wraps']
      },
      Dinner: {
        sweet: ['Chocolate Cake', 'Ice Cream'],
        spicy: ['Grilled Steak', 'BBQ Ribs', 'Spicy Chicken'],
        mild: ['Grilled Fish', 'Mashed Potatoes', 'Pasta Alfredo']
      }
    }
  };

  const cuisines = Object.keys(mealDatabase);
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
  const tastes = ['mild', 'spicy', 'sweet'];

  const initializeUser = (username) => {
    setCurrentUser(username);
    if (!meals[username]) {
      const emptyWeek = {};
      days.forEach(day => { emptyWeek[day] = { lunch: null, dinner: null, morning: null }; });
      setMeals(prev => ({ ...prev, [username]: emptyWeek }));
    }
    if (!userMeals[username]) {
      setUserMeals(prev => ({ ...prev, [username]: [] }));
    }
    setCurrentScreen('dashboard');
  };

  const createNewUser = () => {
    if (newUserName.trim() === '') return;
    
    setUsers(prev => ({
      ...prev,
      [newUserName]: { name: newUserName, meals: {}, weeklyPlans: [], preferences: {}, cuisines: [], mealTypes: [] }
    }));

    const emptyWeek = {};
    days.forEach(day => { emptyWeek[day] = { lunch: null, dinner: null, morning: null }; });
    setMeals(prev => ({ ...prev, [newUserName]: emptyWeek }));
    setUserMeals(prev => ({ ...prev, [newUserName]: [] }));

    setCurrentUser(newUserName);
    setNewUserName('');
    setShowAddUser(false);
    setSetupStep(1);
    setSelectedCuisines([]);
    setSelectedMealTypes([]);
    setSelectedTastes([]);
    setCurrentScreen('setupNewUser');
  };

  const toggleCuisine = (cuisine) => {
    setSelectedCuisines(prev => 
      prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
    );
  };

  const toggleMealType = (mealType) => {
    setSelectedMealTypes(prev => 
      prev.includes(mealType) ? prev.filter(m => m !== mealType) : [...prev, mealType]
    );
  };

  const toggleTaste = (taste) => {
    setSelectedTastes(prev => 
      prev.includes(taste) ? prev.filter(t => t !== taste) : [...prev, taste]
    );
  };

  const getCuratedMeals = () => {
    const meals = [];
    
    selectedCuisines.forEach(cuisine => {
      mealTypes.forEach(mealType => {
        const mealOptions = mealDatabase[cuisine][mealType];
        if (mealOptions) {
          selectedTastes.forEach(taste => {
            if (mealOptions[taste] && mealOptions[taste].length > 0) {
              mealOptions[taste].forEach(mealName => {
                meals.push({
                  id: `${cuisine}-${mealType}-${taste}-${mealName}`,
                  name: mealName,
                  type: mealType,
                  cuisine: cuisine,
                  taste: taste,
                  calories: Math.floor(Math.random() * 200) + 300
                });
              });
            }
          });
        }
      });
    });

    return [...new Set(meals.map(m => m.name))].map((name, idx) => ({
      id: idx,
      name: name,
      type: 'Lunch',
      calories: Math.floor(Math.random() * 200) + 300
    }));
  };

  const finishSetup = () => {
    const curatedMeals = getCuratedMeals();
    setUserMeals(prev => ({
      ...prev,
      [currentUser]: curatedMeals
    }));

    setUsers(prev => ({
      ...prev,
      [currentUser]: {
        ...prev[currentUser],
        cuisines: selectedCuisines,
        mealTypes: selectedMealTypes
      }
    }));

    setCurrentScreen('dashboard');
  };

  const generateIntelligentPlan = () => {
    const plan = {};
    const usedMeals = new Set();
    const availableMeals = userMeals[currentUser] || [];
    
    const mealsByType = {
      Lunch: availableMeals.filter(m => m.type === 'Lunch'),
      Dinner: availableMeals.filter(m => m.type === 'Dinner'),
      Breakfast: availableMeals.filter(m => m.type === 'Breakfast')
    };

    days.forEach((day, dayIndex) => {
      plan[day] = {};

      const availableBreakfasts = mealsByType['Breakfast'].filter(m => !usedMeals.has(m.id));
      if (availableBreakfasts.length > 0) {
        const breakfastMeal = availableBreakfasts[Math.floor(Math.random() * availableBreakfasts.length)];
        plan[day].morning = breakfastMeal;
        usedMeals.add(breakfastMeal.id);
      }

      const availableLunches = mealsByType['Lunch'].filter(m => !usedMeals.has(m.id));
      if (availableLunches.length > 0) {
        const lunchMeal = availableLunches[Math.floor(Math.random() * availableLunches.length)];
        plan[day].lunch = lunchMeal;
        usedMeals.add(lunchMeal.id);
      }

      const availableDinners = mealsByType['Dinner'].filter(m => !usedMeals.has(m.id));
      if (availableDinners.length > 0) {
        const dinnerMeal = availableDinners[Math.floor(Math.random() * availableDinners.length)];
        plan[day].dinner = dinnerMeal;
        usedMeals.add(dinnerMeal.id);
      }
    });

    const newPlan = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      week: plan,
    };

    setWeeklyPlans(prev => ({
      ...prev,
      [currentUser]: [...(prev[currentUser] || []), newPlan],
    }));

    setMeals(prev => ({
      ...prev,
      [currentUser]: plan,
    }));

    setCurrentScreen('planner');
  };

  const calculateWeeklyCalories = (userWeek) => {
    let total = 0;
    Object.values(userWeek).forEach(day => {
      Object.values(day).forEach(meal => {
        if (meal) total += meal.calories;
      });
    });
    return total;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
  };

  // Login Screen
  const LoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">🍽️ MealPlan</h1>
          <p className="text-gray-400">AI-Powered Family Meal Planning</p>
        </div>

        <div className="space-y-4">
          {Object.keys(users).map(name => (
            <button
              key={name}
              onClick={() => initializeUser(name)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold transition transform hover:scale-105"
            >
              Login as {name}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddUser(!showAddUser)}
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Add New User
        </button>

        {showAddUser && (
          <div className="mt-6 bg-gray-800 p-6 rounded-lg">
            <input
              type="text"
              placeholder="Enter new user name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              autoFocus
              className="w-full bg-gray-700 text-white px-4 py-2 rounded mb-3 border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={createNewUser}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-semibold transition"
              >
                Create User
              </button>
              <button
                onClick={() => { setShowAddUser(false); setNewUserName(''); }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-400 text-center text-sm">✨ Powered by Intelligent Meal Planning</p>
        </div>
      </div>
    </div>
  );

  // New User Setup Screen
  const SetupNewUserScreen = () => {
    if (setupStep === 1) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome, {currentUser}! 👋</h1>
            <p className="text-gray-400 mb-8">Let's discover your perfect meals. Step 1: Select cuisines</p>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">🌍 What cuisines do you enjoy?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cuisines.map(cuisine => (
                  <button
                    key={cuisine}
                    onClick={() => toggleCuisine(cuisine)}
                    className={`p-4 rounded-lg font-semibold transition text-left ${
                      selectedCuisines.includes(cuisine)
                        ? 'bg-blue-600 text-white border-2 border-blue-500'
                        : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-blue-500'
                    }`}
                  >
                    {cuisine}
                    {selectedCuisines.includes(cuisine) && ' ✓'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentScreen('login')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setSetupStep(2)}
                disabled={selectedCuisines.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (setupStep === 2) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <h1 className="text-4xl font-bold text-white mb-2">Step 2: Meal Types & Tastes</h1>
            <p className="text-gray-400 mb-8">Select the meal times and taste preferences</p>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">⏰ Which meal times?</h2>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {mealTypes.map(mealType => (
                  <button
                    key={mealType}
                    onClick={() => toggleMealType(mealType)}
                    className={`p-4 rounded-lg font-semibold transition ${
                      selectedMealTypes.includes(mealType)
                        ? 'bg-green-600 text-white border-2 border-green-500'
                        : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-green-500'
                    }`}
                  >
                    {mealType}
                    {selectedMealTypes.includes(mealType) && ' ✓'}
                  </button>
                ))}
              </div>

              <h2 className="text-xl font-bold text-white mb-4">🌶️ Your taste preferences?</h2>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => toggleTaste('mild')}
                  className={`p-4 rounded-lg font-semibold transition flex items-center gap-2 ${
                    selectedTastes.includes('mild')
                      ? 'bg-blue-600 text-white border-2 border-blue-500'
                      : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-blue-500'
                  }`}
                >
                  <Leaf size={20} /> Mild
                  {selectedTastes.includes('mild') && ' ✓'}
                </button>
                <button
                  onClick={() => toggleTaste('spicy')}
                  className={`p-4 rounded-lg font-semibold transition flex items-center gap-2 ${
                    selectedTastes.includes('spicy')
                      ? 'bg-orange-600 text-white border-2 border-orange-500'
                      : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-orange-500'
                  }`}
                >
                  <Flame size={20} /> Spicy
                  {selectedTastes.includes('spicy') && ' ✓'}
                </button>
                <button
                  onClick={() => toggleTaste('sweet')}
                  className={`p-4 rounded-lg font-semibold transition flex items-center gap-2 ${
                    selectedTastes.includes('sweet')
                      ? 'bg-pink-600 text-white border-2 border-pink-500'
                      : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-pink-500'
                  }`}
                >
                  <ChefHat size={20} /> Sweet
                  {selectedTastes.includes('sweet') && ' ✓'}
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setSetupStep(1)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setSetupStep(3)}
                disabled={selectedMealTypes.length === 0 || selectedTastes.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (setupStep === 3) {
      const curatedMeals = getCuratedMeals();

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">Step 3: Your Curated Meals</h1>
            <p className="text-gray-400 mb-8">Based on your preferences, here are your meals. Review and customize if needed.</p>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {curatedMeals.slice(0, 12).map((meal, idx) => (
                  <div key={idx} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition">
                    <p className="text-white font-semibold">{meal.name}</p>
                    <p className="text-gray-400 text-sm mt-1">⚡ {meal.calories} cal</p>
                    <p className="text-gray-500 text-xs mt-2">Lunch</p>
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-sm mt-4">Total meals: {curatedMeals.length}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setSetupStep(2)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition"
              >
                ← Back
              </button>
              <button
                onClick={finishSetup}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <Check size={20} /> Let's Start Planning!
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  // Dashboard Screen
  const DashboardScreen = () => {
    const userWeek = meals[currentUser] || {};
    const weeklyCalories = calculateWeeklyCalories(userWeek);
    const avgDaily = Math.round(weeklyCalories / 7);
    const mealCount = Object.values(userWeek).reduce((count, day) => count + Object.values(day).filter(m => m).length, 0);
    const hasActivePlan = mealCount > 0;
    const userCuisines = users[currentUser]?.cuisines || [];

    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">Welcome, {currentUser}! 👋</h1>
            <p className="text-gray-400">Your AI-powered weekly nutrition dashboard</p>
            {userCuisines.length > 0 && (
              <p className="text-blue-400 text-sm mt-2">Cuisines: {userCuisines.join(', ')}</p>
            )}
          </div>
          <button
            onClick={() => setCurrentScreen('profile')}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
          >
            <User size={20} /> Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-lg border border-blue-700">
            <p className="text-gray-300 text-sm mb-2">Meals This Week</p>
            <p className="text-4xl font-bold text-blue-300">{mealCount}</p>
          </div>
          <div className="bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-lg border border-green-700">
            <p className="text-gray-300 text-sm mb-2">Weekly Calories</p>
            <p className="text-4xl font-bold text-green-300">{weeklyCalories.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-lg border border-purple-700">
            <p className="text-gray-300 text-sm mb-2">Daily Average</p>
            <p className="text-4xl font-bold text-purple-300">{avgDaily}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-900 to-orange-800 p-6 rounded-lg border border-orange-700">
            <p className="text-gray-300 text-sm mb-2">Health Score</p>
            <p className="text-4xl font-bold text-orange-300">78%</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles size={24} className="text-yellow-400" /> Generate Your Weekly Plan
          </h2>
          <p className="text-gray-400 mb-6">Let our AI create a perfectly balanced meal plan based on your preferences.</p>
          <button
            onClick={generateIntelligentPlan}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-4 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <Sparkles size={20} /> Generate Intelligent Plan
          </button>
        </div>
      </div>
    );
  };

  // Profile Screen
  const ProfileScreen = () => (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Profile & Family</h1>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Your Profile</h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm">Name</p>
            <p className="text-white text-lg font-semibold">{currentUser}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Member Since</p>
            <p className="text-white text-lg font-semibold">2025</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Health Score</p>
            <p className="text-green-400 text-lg font-semibold">78/100</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Users size={24} /> Family Members
        </h2>
        <div className="space-y-3 mb-4">
          {Object.keys(users).map(member => (
            <div key={member} className="bg-gray-800 p-4 rounded flex justify-between items-center">
              <span className="text-white font-semibold">{member}</span>
              <span className="text-gray-400 text-sm">Health Score: 75%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Weekly Planner Screen
  const PlannerScreen = () => {
    const userWeek = meals[currentUser] || {};

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
          <Calendar size={32} /> Weekly Meal Plan
        </h1>

        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-gray-800 text-white p-4 text-left border border-gray-700">Meal Type</th>
                {days.map(day => (
                  <th key={day} className="bg-gradient-to-b from-blue-700 to-blue-900 text-white p-4 text-center border border-blue-600 font-bold">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['morning', 'lunch', 'dinner'].map(mealType => (
                <tr key={mealType}>
                  <td className="bg-gray-800 text-white p-4 border border-gray-700 font-semibold capitalize">
                    {mealType}
                  </td>
                  {days.map(day => (
                    <td key={`${day}-${mealType}`} className="bg-gray-900 p-3 border border-gray-700">
                      {userWeek[day] && userWeek[day][mealType] ? (
                        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-3 rounded border border-gray-600">
                          <p className="text-white font-semibold text-sm">{userWeek[day][mealType].name}</p>
                          <p className="text-gray-400 text-xs mt-1">⚡ {userWeek[day][mealType].calories} cal</p>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <Printer size={20} /> Print Plan
          </button>
          <button
            onClick={() => alert('📧 Email functionality would send this plan')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <Mail size={20} /> Email Plan
          </button>
          <button
            onClick={() => alert('💬 WhatsApp sharing available')}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <MessageCircle size={20} /> Share on WhatsApp
          </button>
          <button
            onClick={generateIntelligentPlan}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition ml-auto"
          >
            <Sparkles size={20} /> Generate New Plan
          </button>
        </div>
      </div>
    );
  };

  // History Screen
  const HistoryScreen = () => {
    const userPlans = weeklyPlans[currentUser] || [];

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Historic Weekly Plans</h1>

        {userPlans.length === 0 ? (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-12 text-center">
            <p className="text-gray-400 mb-4">No plans generated yet</p>
            <button
              onClick={() => { setCurrentScreen('dashboard'); generateIntelligentPlan(); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition"
            >
              Generate Your First Plan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {[...userPlans].reverse().map((plan, idx) => (
              <div key={plan.id} className="bg-gray-900 border border-gray-700 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold">Week Plan #{userPlans.length - idx}</h3>
                    <p className="text-gray-400 text-sm">Generated: {plan.date}</p>
                  </div>
                  <ChevronRight className="text-gray-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {currentScreen === 'login' && <LoginScreen />}
      {currentScreen === 'setupNewUser' && <SetupNewUserScreen />}

      {currentScreen !== 'login' && currentScreen !== 'setupNewUser' && (
        <>
          <div className="pb-24">
            {currentScreen === 'dashboard' && <DashboardScreen />}
            {currentScreen === 'planner' && <PlannerScreen />}
            {currentScreen === 'profile' && <ProfileScreen />}
            {currentScreen === 'history' && <HistoryScreen />}
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 flex justify-around">
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className={`flex-1 py-4 flex flex-col items-center gap-1 transition ${currentScreen === 'dashboard' ? 'text-blue-400 border-t-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Home size={24} />
              <span className="text-xs">Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentScreen('planner')}
              className={`flex-1 py-4 flex flex-col items-center gap-1 transition ${currentScreen === 'planner' ? 'text-blue-400 border-t-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Calendar size={24} />
              <span className="text-xs">Planner</span>
            </button>
            <button
              onClick={() => setCurrentScreen('profile')}
              className={`flex-1 py-4 flex flex-col items-center gap-1 transition ${currentScreen === 'profile' ? 'text-blue-400 border-t-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Users size={24} />
              <span className="text-xs">Family</span>
            </button>
            <button
              onClick={() => setCurrentScreen('history')}
              className={`flex-1 py-4 flex flex-col items-center gap-1 transition ${currentScreen === 'history' ? 'text-blue-400 border-t-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Activity size={24} />
              <span className="text-xs">History</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-4 flex flex-col items-center gap-1 text-gray-500 hover:text-red-400 transition"
            >
              <LogOut size={24} />
              <span className="text-xs">Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}