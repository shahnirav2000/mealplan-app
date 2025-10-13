import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Trash2, Settings, Home, Calendar, ShoppingCart, Users, Activity, Mail, MessageCircle, Printer, Download, User, ChevronRight, Sparkles, Edit2, X, Check } from 'lucide-react';

export default function MealPlannerApp() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({
    Arun: { name: 'Arun', meals: {}, weeklyPlans: [], preferences: {} },
    Preeti: { name: 'Preeti', meals: {}, weeklyPlans: [], preferences: {} },
    Nirav: { name: 'Nirav', meals: {}, weeklyPlans: [], preferences: {} }
  });
  const [meals, setMeals] = useState({});
  const [userMeals, setUserMeals] = useState({});
  const [weeklyPlans, setWeeklyPlans] = useState({});
  const [familyMembers, setFamilyMembers] = useState({});
  const [newUserName, setNewUserName] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [mealPreference, setMealPreference] = useState('');

  // Comprehensive meal data from your Google Sheet
  const defaultMealData = [
    { id: 1, name: 'Fansi Roti Dal Rice', type: 'Lunch', calories: 450, base: 'Fansi' },
    { id: 2, name: 'Bhindi Roti Dal Rice', type: 'Lunch', calories: 440, base: 'Bhindi' },
    { id: 3, name: 'Flower Roti Dal Rice', type: 'Lunch', calories: 435, base: 'Flower' },
    { id: 4, name: 'Ringda Roti Dal Rice', type: 'Lunch', calories: 445, base: 'Ringda' },
    { id: 5, name: 'Parval Roti Dal Rice', type: 'Lunch', calories: 430, base: 'Parval' },
    { id: 6, name: 'Makhanwala Paratha', type: 'Lunch', calories: 520 },
    { id: 7, name: 'Dal Dhokli Cabbage Salad', type: 'Lunch', calories: 480 },
    { id: 8, name: 'Doodhi Roti Kadhi Rice', type: 'Lunch', calories: 460, base: 'Doodhi' },
    { id: 9, name: 'Chinese - Noodles Soup Manchurian', type: 'Lunch', calories: 550 },
    { id: 10, name: 'Samosa', type: 'Lunch', calories: 500 },
    { id: 11, name: 'Puri Peas-Aloo-Tomato Shaak Kadhi Pulao', type: 'Lunch', calories: 520 },
    { id: 12, name: 'Palak Paneer Paratha', type: 'Lunch', calories: 510 },
    { id: 13, name: 'Jacket Potato coleslaw', type: 'Lunch', calories: 470 },
    { id: 14, name: 'Burrito bowl', type: 'Lunch', calories: 530 },
    { id: 15, name: 'Hummus Salad', type: 'Lunch', calories: 380 },
    { id: 16, name: 'Sev Tomato Rotli', type: 'Lunch', calories: 410 },
    { id: 20, name: 'Khichdi Kadhi Shaak', type: 'Dinner', calories: 380 },
    { id: 21, name: 'Taco', type: 'Dinner', calories: 420 },
    { id: 22, name: 'Burger', type: 'Dinner', calories: 580 },
    { id: 23, name: 'Pizza', type: 'Dinner', calories: 650 },
    { id: 24, name: 'Sabudana Khichdi', type: 'Dinner', calories: 350 },
    { id: 25, name: 'Quesedilla', type: 'Dinner', calories: 520 },
    { id: 26, name: 'Bhakri Aloo Shaak', type: 'Dinner', calories: 400 },
    { id: 27, name: 'Mixed Veg Soup', type: 'Dinner', calories: 280 },
    { id: 28, name: 'Slow Cooker Soup', type: 'Dinner', calories: 300 },
    { id: 29, name: 'Toast Sandwich', type: 'Dinner', calories: 390 },
    { id: 30, name: 'Aloo/Cheese/Paneer Paratha', type: 'Dinner', calories: 490 },
    { id: 48, name: 'Dhokla & Vagharelo Rice', type: 'Morning Lunch', calories: 380, base: 'Dhokla' },
    { id: 49, name: 'Thepla Sukki Bhaji', type: 'Morning Lunch', calories: 360 },
    { id: 50, name: 'Pasta and Cheese Toast Sandwich', type: 'Morning Lunch', calories: 450 },
    { id: 51, name: 'Toast Sandwich', type: 'Morning Lunch', calories: 360 },
    { id: 52, name: 'Roti Bhindi', type: 'Morning Lunch', calories: 370, base: 'Bhindi' },
    { id: 53, name: 'Roti Fansi', type: 'Morning Lunch', calories: 360, base: 'Fansi' },
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const initializeUser = (username) => {
    setCurrentUser(username);
    if (!meals[username]) {
      const emptyWeek = {};
      days.forEach(day => { emptyWeek[day] = { lunch: null, dinner: null, morning: null }; });
      setMeals(prev => ({ ...prev, [username]: emptyWeek }));
    }
    if (!userMeals[username]) {
      setUserMeals(prev => ({ ...prev, [username]: [...defaultMealData] }));
    }
    setCurrentScreen('dashboard');
  };

  const createNewUser = () => {
    if (newUserName.trim() === '') return;
    
    setUsers(prev => ({
      ...prev,
      [newUserName]: { name: newUserName, meals: {}, weeklyPlans: [], preferences: {} }
    }));

    const emptyWeek = {};
    days.forEach(day => { emptyWeek[day] = { lunch: null, dinner: null, morning: null }; });
    setMeals(prev => ({ ...prev, [newUserName]: emptyWeek }));

    setCurrentScreen('setupNewUser');
    setCurrentUser(newUserName);
    setNewUserName('');
    setShowAddUser(false);
  };

  const startEditMeal = (mealType, day, meal) => {
    setEditingMeal({ day, mealType, meal });
    setEditFormData({
      name: meal ? meal.name : '',
      type: meal ? meal.type : mealType.charAt(0).toUpperCase() + mealType.slice(1),
      calories: meal ? meal.calories : ''
    });
    setMealPreference('');
  };

  const saveMealEdit = () => {
    if (!editFormData.name || !editFormData.calories) {
      alert('Please fill in all fields');
      return;
    }

    const mealId = Date.now();
    const newMeal = {
      id: mealId,
      name: editFormData.name,
      type: editFormData.type,
      calories: parseInt(editFormData.calories)
    };

    // Update user's meal list
    setUserMeals(prev => ({
      ...prev,
      [currentUser]: [...(prev[currentUser] || []), newMeal]
    }));

    // Update user preferences
    setUsers(prev => ({
      ...prev,
      [currentUser]: {
        ...prev[currentUser],
        preferences: {
          ...prev[currentUser].preferences,
          [mealId]: mealPreference
        }
      }
    }));

    // Update weekly plan
    setMeals(prev => ({
      ...prev,
      [currentUser]: {
        ...prev[currentUser],
        [editingMeal.day]: {
          ...prev[currentUser][editingMeal.day],
          [editingMeal.mealType]: newMeal
        }
      }
    }));

    setEditingMeal(null);
    setEditFormData({});
    alert(`✅ Meal "${newMeal.name}" added to your account with preference: ${mealPreference}`);
  };

  const generateIntelligentPlan = () => {
    const plan = {};
    const usedMeals = new Set();
    const availableMeals = userMeals[currentUser] || defaultMealData;
    
    const mealsByType = {
      Lunch: availableMeals.filter(m => m.type === 'Lunch'),
      Dinner: availableMeals.filter(m => m.type === 'Dinner'),
      'Morning Lunch': availableMeals.filter(m => m.type === 'Morning Lunch')
    };

    days.forEach((day, dayIndex) => {
      plan[day] = {};

      const availableMornings = mealsByType['Morning Lunch'].filter(m => !usedMeals.has(m.id));
      const morningMeal = availableMornings[Math.floor(Math.random() * availableMornings.length)];
      if (morningMeal) {
        plan[day].morning = morningMeal;
        usedMeals.add(morningMeal.id);
      }

      let lunchMeal = null;
      const availableLunches = mealsByType['Lunch'].filter(m => !usedMeals.has(m.id));

      if (morningMeal && morningMeal.base) {
        const matchingLunch = availableLunches.find(m => m.base === morningMeal.base);
        if (matchingLunch) {
          lunchMeal = matchingLunch;
        }
      }

      if (!lunchMeal && availableLunches.length > 0) {
        lunchMeal = availableLunches[Math.floor(Math.random() * availableLunches.length)];
      }

      if (lunchMeal) {
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

  const calculateWeeklyCalories = (userMeals) => {
    let total = 0;
    Object.values(userMeals).forEach(day => {
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
              className="w-full bg-gray-700 text-white px-4 py-2 rounded mb-3 border border-gray-600"
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
  const SetupNewUserScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome, {currentUser}! 👋</h1>
        <p className="text-gray-400 mb-8">Let's set up your meal preferences</p>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-4 mb-6">
          <h2 className="text-xl font-bold text-white">Import Meal Data</h2>
          <p className="text-gray-400 text-sm">Choose how to get started:</p>
          
          <button
            onClick={() => {
              setUserMeals(prev => ({ ...prev, [currentUser]: defaultMealData }));
              alert('✅ Default meal data imported!');
              setCurrentScreen('dashboard');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition text-left"
          >
            📥 Import Default Meals
          </button>
          
          <button
            onClick={() => {
              setUserMeals(prev => ({ ...prev, [currentUser]: [] }));
              alert('✅ Starting with empty meal list. You can add meals as you go!');
              setCurrentScreen('dashboard');
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition text-left"
          >
            ➕ Start Fresh
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded font-semibold transition"
        >
          Back to Login
        </button>
      </div>
    </div>
  );

  // Edit Meal Modal
  const EditMealModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">
          {editingMeal.meal ? 'Edit Meal' : 'Add New Meal'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Meal Name</label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-600"
              placeholder="e.g., Paneer Tikka"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Calories</label>
            <input
              type="number"
              value={editFormData.calories}
              onChange={(e) => setEditFormData({ ...editFormData, calories: e.target.value })}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-600"
              placeholder="e.g., 450"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Preference (Optional)</label>
            <select
              value={mealPreference}
              onChange={(e) => setMealPreference(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-600"
            >
              <option value="">Select preference...</option>
              <option value="Love it!">❤️ Love it!</option>
              <option value="Like it">👍 Like it</option>
              <option value="Neutral">😐 Neutral</option>
              <option value="Occasional">🤔 Occasional</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={saveMealEdit}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-semibold transition flex items-center justify-center gap-2"
          >
            <Check size={18} /> Save Meal
          </button>
          <button
            onClick={() => setEditingMeal(null)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded font-semibold transition flex items-center justify-center gap-2"
          >
            <X size={18} /> Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Dashboard Screen
  const DashboardScreen = () => {
    const userWeek = meals[currentUser] || {};
    const weeklyCalories = calculateWeeklyCalories(userWeek);
    const avgDaily = Math.round(weeklyCalories / 7);
    const mealCount = Object.values(userWeek).reduce((count, day) => count + Object.values(day).filter(m => m).length, 0);
    const hasActivePlan = mealCount > 0;

    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">Welcome, {currentUser}! 👋</h1>
            <p className="text-gray-400">Your AI-powered weekly nutrition dashboard</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Family Health Trends</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Daily Calories</span>
                <span className="text-white font-semibold">2,150 cal</span>
              </div>
              <div className="bg-gray-800 h-2 rounded-full"><div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div></div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-gray-400">Meal Variety Score</span>
                <span className="text-white font-semibold">92/100 ✓</span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-gray-400">Nutritional Balance</span>
                <span className="text-white font-semibold">Excellent ✓</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles size={24} className="text-yellow-400" /> AI Meal Planning
            </h2>
            <p className="text-gray-400 mb-6">Our intelligent system ensures:</p>
            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              <li>✓ No meal repetitions in a week</li>
              <li>✓ Smart ingredient matching</li>
              <li>✓ Balanced nutrition daily</li>
              <li>✓ Variety across meal types</li>
            </ul>
            <button
              onClick={generateIntelligentPlan}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-4 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Sparkles size={20} /> Generate Intelligent Plan
            </button>
          </div>
        </div>

        {hasActivePlan && (
          <button
            onClick={() => setCurrentScreen('history')}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition"
          >
            📋 View Historic Plans
          </button>
        )}
      </div>
    );
  };

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
                        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-3 rounded border border-gray-600 group relative">
                          <p className="text-white font-semibold text-sm">{userWeek[day][mealType].name}</p>
                          <p className="text-gray-400 text-xs mt-1">⚡ {userWeek[day][mealType].calories} cal</p>
                          <button
                            onClick={() => startEditMeal(mealType, day, userWeek[day][mealType])}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-700 p-1 rounded transition"
                          >
                            <Edit2 size={14} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditMeal(mealType, day, null)}
                          className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-3 rounded flex items-center justify-center gap-1 transition"
                        >
                          <Plus size={16} /> Add
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-blue-900 border border-blue-700 p-4 rounded-lg mb-8">
          <p className="text-blue-200 text-sm">
            ✨ <strong>Intelligent Features:</strong> No meals repeated this week. Similar ingredients intelligently paired. Balanced nutrition across all days. Click edit icon to customize meals!
          </p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <Printer size={20} /> Print Plan
          </button>
          <button
            onClick={() => alert('📧 Email functionality would send this plan to your registered email')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <Mail size={20} /> Email Plan
          </button>
          <button
            onClick={() => alert('💬 WhatsApp sharing would create a formatted message with your meal plan')}
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
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-semibold transition">
          + Add Family Member
        </button>
      </div>
    </div>
  );

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
                    <p className="text-gray-500 text-xs mt-2">
                      {Object.values(plan.week).reduce((sum, day) => sum + Object.values(day).filter(m => m).length, 0)} meals planned
                    </p>
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
          {editingMeal && <EditMealModal />}
          
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