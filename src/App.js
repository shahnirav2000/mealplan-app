import React, { useState, useEffect, useMemo } from 'react';
import { LogOut, Plus, Trash2, Settings, Home, Calendar, ShoppingCart, Users, Activity, Mail, MessageCircle, Printer, Download, User, ChevronRight, Sparkles, Edit2, X, Check, ChefHat, Flame, Leaf, AlertCircle, TrendingUp } from 'lucide-react';
import { analyzeMealIntelligent, estimateCaloriesLocal } from './utils/mealIntelligence';

export default function MealPlannerApp() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({});
  const [meals, setMeals] = useState({});
  const [userMeals, setUserMeals] = useState({});
  const [weeklyPlans, setWeeklyPlans] = useState({});
  const [newUserName, setNewUserName] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedTastes, setSelectedTastes] = useState([]);
  const [selectedTastesByMealType, setSelectedTastesByMealType] = useState({});
  const [editingMeal, setEditingMeal] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [mealPreference, setMealPreference] = useState('');
  const [showCustomMealPopup, setShowCustomMealPopup] = useState(false);
  const [customMealData, setCustomMealData] = useState({
    name: '',
    calories: '',
    cuisine: '',
    mealTypes: [],
    taste: 'mild'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [intelligenceStats, setIntelligenceStats] = useState({
    totalAnalyses: 0,
    totalCost: 0,
    methodBreakdown: {}
  });

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
        spicy: ['Makhanwala Paratha', 'Palak Paneer Paratha', 'Paneer Butter Masala', 'Aloo Gobi'],
        mild: ['Rajma Rice', 'Chole Bhature', 'Dal Makhani']
      },
      Dinner: {
        sweet: ['Gulab Jamun', 'Kheer'],
        spicy: ['Sarson da Saag', 'Chana Masala', 'Paneer Tikka', 'Aloo Jeera'],
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
        mild: ['Vegetable Momos', 'Rice Porridge', 'Steamed Buns']
      },
      Lunch: {
        sweet: [],
        spicy: ['Veg Manchurian', 'Kung Pao Tofu', 'Hakka Noodles', 'Szechwan Noodles'],
        mild: ['Veg Fried Rice', 'Vegetable Noodles', 'Steamed Broccoli', 'Sweet Corn Soup']
      },
      Dinner: {
        sweet: ['Fortune Cookies'],
        spicy: ['Chilli Garlic Noodles', 'Szechwan Vegetables', 'Hot & Sour Soup'],
        mild: ['Veg Fried Rice', 'Vegetable Lo Mein', 'Steamed Dumplings']
      }
    },
    'Italian': {
      Breakfast: {
        sweet: ['Panettone', 'Biscotti'],
        spicy: [],
        mild: ['Cappuccino Toast', 'Fruit Salad', 'Bruschetta']
      },
      Lunch: {
        sweet: [],
        spicy: ['Arrabbiata Pasta', 'Spicy Veggie Pizza'],
        mild: ['Vegetable Pasta', 'Margherita Pizza', 'Vegetable Lasagna', 'Mushroom Risotto']
      },
      Dinner: {
        sweet: ['Tiramisu', 'Panna Cotta'],
        spicy: ['Penne Arrabbiata', 'Spicy Veggie Risotto'],
        mild: ['Fettuccine Alfredo', 'Cheese Ravioli', 'Risotto Milanese', 'Caprese Salad']
      }
    },
    'Asian - Other': {
      Breakfast: {
        sweet: ['Thai Sticky Rice', 'Mango Sticky Rice'],
        spicy: ['Thai Spiced Tofu', 'Vegetable Pho'],
        mild: ['Congee', 'Vegetable Banh Mi', 'Rice Noodle Soup']
      },
      Lunch: {
        sweet: [],
        spicy: ['Thai Green Curry', 'Tom Yum Soup', 'Vietnamese Spring Rolls', 'Spicy Basil Tofu'],
        mild: ['Tom Kha Soup', 'Pad Thai', 'Vietnamese Salad', 'Coconut Rice']
      },
      Dinner: {
        sweet: ['Mango Sticky Rice'],
        spicy: ['Vegetable Green Curry', 'Red Curry', 'Spicy Tom Yum'],
        mild: ['Panang Curry', 'Pad See Ew', 'Vegetable Pho']
      }
    },
    'Continental': {
      Breakfast: {
        sweet: ['Pancakes', 'Croissants', 'Waffles', 'French Toast'],
        spicy: ['Spicy Scrambled Eggs', 'Hash Browns with Salsa'],
        mild: ['Oatmeal', 'Fruit Salad', 'Toast Sandwich', 'Avocado Toast']
      },
      Lunch: {
        sweet: [],
        spicy: ['Veggie Burger', 'Spicy Bean Tacos', 'Jalapeño Grilled Cheese'],
        mild: ['Garden Salad', 'Veggie Sandwich', 'Wraps', 'Grilled Vegetables', 'Quinoa Bowl']
      },
      Dinner: {
        sweet: ['Chocolate Cake', 'Ice Cream', 'Cheesecake'],
        spicy: ['Spicy Veggie Stir Fry', 'Mexican Rice Bowl'],
        mild: ['Grilled Vegetables', 'Mashed Potatoes', 'Pasta Alfredo', 'Mushroom Soup', 'Baked Potato']
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
    if (!userMeals[username] || userMeals[username].length === 0) {
      // Generate curated meals based on user's preferences
      const user = users[username];
      const curatedMeals = [];

      if (user.cuisines && user.cuisines.length > 0) {
        user.cuisines.forEach(cuisine => {
          ['Breakfast', 'Lunch', 'Dinner'].forEach(mealType => {
            const mealOptions = mealDatabase[cuisine]?.[mealType];
            if (mealOptions) {
              (user.tastes || ['mild', 'spicy', 'sweet']).forEach(taste => {
                if (mealOptions[taste] && mealOptions[taste].length > 0) {
                  mealOptions[taste].forEach(mealName => {
                    curatedMeals.push({
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
      }

      setUserMeals(prev => ({ ...prev, [username]: curatedMeals }));
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

    // Iterate through each selected meal type
    selectedMealTypes.forEach(mealType => {
      const mealTypePrefs = selectedTastesByMealType[mealType];

      if (!mealTypePrefs) return;

      const cuisines = mealTypePrefs.cuisines || [];
      const tastes = mealTypePrefs.tastes || [];

      // For each cuisine selected for this meal type
      cuisines.forEach(cuisine => {
        const mealOptions = mealDatabase[cuisine]?.[mealType];
        if (mealOptions) {
          // For each taste selected for this meal type
          tastes.forEach(taste => {
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

    return meals;
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
        mealTypes: selectedMealTypes,
        tastesByMealType: selectedTastesByMealType
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

    days.forEach((day) => {
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

  const handleEditMeal = (day, mealType) => {
    setEditingMeal({ day, mealType });
    setAnalysisResult(null);
    setCustomMealData({
      name: '',
      calories: '',
      cuisine: '',
      mealTypes: [],
      taste: 'mild'
    });
    setShowCustomMealPopup(true);
  };

  const handleCloseCustomMealPopup = () => {
    setShowCustomMealPopup(false);
    setEditingMeal(null);
    setAnalysisResult(null);
    setCustomMealData({
      name: '',
      calories: '',
      cuisine: '',
      mealTypes: [],
      taste: 'mild'
    });
  };

  const handleAnalyzeMeal = async () => {
    if (!customMealData.name) {
      alert('Please enter meal name to analyze');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeMealIntelligent(
        customMealData.name,
        customMealData.mealTypes[0] || 'Lunch',
        customMealData.cuisine || 'Indian - Gujarati',
        customMealData.taste || 'mild',
        userMeals[currentUser] || [],
        {
          skipNutritionix: false,
          skipClaude: true, // Skip paid API for now
          forceLocal: false
        }
      );

      setAnalysisResult(result);

      // Auto-update calories field
      setCustomMealData(prev => ({
        ...prev,
        calories: result.calories.toString()
      }));

      // Update stats
      setIntelligenceStats(prev => ({
        totalAnalyses: prev.totalAnalyses + 1,
        totalCost: prev.totalCost + (result.costIncurred || 0),
        methodBreakdown: {
          ...prev.methodBreakdown,
          [result.method]: (prev.methodBreakdown[result.method] || 0) + 1
        }
      }));
    } catch (error) {
      console.error('Analysis error:', error);
      // Fallback to local estimation
      const localEstimate = estimateCaloriesLocal(
        customMealData.name,
        customMealData.mealTypes[0] || 'Lunch',
        customMealData.cuisine || 'Indian - Gujarati',
        customMealData.taste || 'mild'
      );
      setAnalysisResult({
        calories: localEstimate.calories,
        confidence: localEstimate.confidence,
        method: 'local_fallback',
        isDuplicate: false
      });
      setCustomMealData(prev => ({
        ...prev,
        calories: localEstimate.calories.toString()
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveCustomMeal = () => {
    if (!customMealData.name || !customMealData.cuisine || customMealData.mealTypes.length === 0) {
      alert('Please fill in all required fields (name, cuisine, meal type)');
      return;
    }

    // Check for duplicate warning
    if (analysisResult && analysisResult.isDuplicate) {
      const proceed = window.confirm(
        `⚠️ Warning: This meal appears to be a duplicate of "${analysisResult.matchedMeal}" (${analysisResult.confidence}% match).\n\nDo you still want to add it?`
      );
      if (!proceed) return;
    }

    // Use analyzed calories or entered calories or fallback to default
    const finalCalories = parseInt(customMealData.calories) ||
                         (analysisResult ? analysisResult.calories : 400);

    const newMeal = {
      id: `custom-${Date.now()}`,
      name: customMealData.name,
      type: customMealData.mealTypes[0],
      cuisine: customMealData.cuisine,
      taste: customMealData.taste,
      calories: finalCalories,
      isCustom: true,
      confidence: analysisResult ? analysisResult.confidence : 50,
      analysisMethod: analysisResult ? analysisResult.method : 'manual'
    };

    // Add custom meal to user's meal library
    setUserMeals(prev => ({
      ...prev,
      [currentUser]: [...(prev[currentUser] || []), newMeal]
    }));

    // Update the weekly plan with the new meal
    if (editingMeal) {
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
    }

    handleCloseCustomMealPopup();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
  };

  // Landing/Login Screen
  const LoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-16">
          <h1 className="text-6xl font-bold text-white mb-4">🍽️ MealPlan</h1>
          <p className="text-2xl text-gray-300 mb-2">AI-Powered Personalized Meal Planning</p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Create intelligent weekly meal plans with duplicate detection, calorie estimation, and multi-cuisine support
          </p>
        </div>

        {/* Mindset Change Section - Animated */}
        <div className="mb-12 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-900 via-orange-900 to-red-900 border-2 border-yellow-700 rounded-xl p-8 relative">
            <div className="absolute top-0 right-0 text-6xl animate-bounce">🧠</div>
            <h2 className="text-3xl font-bold text-yellow-300 mb-6 text-center">
              Wait... It's Not Just About Food! 🤯
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Before Mindset */}
              <div className="bg-black bg-opacity-30 rounded-lg p-6 border-2 border-red-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-red-500 opacity-10 animate-pulse"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl animate-spin-slow">😰</span>
                    <h3 className="text-xl font-bold text-red-300">Old You</h3>
                  </div>
                  <ul className="space-y-2 text-red-200 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">❌</span>
                      <span>"I'll start my diet tomorrow..."</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">❌</span>
                      <span>"One more slice of pizza won't hurt"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">❌</span>
                      <span>"Healthy food is expensive & boring"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">❌</span>
                      <span>"I don't have time to meal plan"</span>
                    </li>
                  </ul>
                  <div className="mt-4 text-center">
                    <span className="inline-block bg-red-800 text-red-200 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                      Result: Feeling Sluggish 😴
                    </span>
                  </div>
                </div>
              </div>

              {/* After Mindset */}
              <div className="bg-black bg-opacity-30 rounded-lg p-6 border-2 border-green-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-green-500 opacity-10 animate-pulse"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl animate-bounce">💪</span>
                    <h3 className="text-xl font-bold text-green-300">New You</h3>
                  </div>
                  <ul className="space-y-2 text-green-200 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">✅</span>
                      <span>"Planning = Freedom to enjoy food"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">✅</span>
                      <span>"Smart choices = More energy daily"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">✅</span>
                      <span>"Variety keeps it exciting & tasty"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">✅</span>
                      <span>"5 mins planning = Hours saved"</span>
                    </li>
                  </ul>
                  <div className="mt-4 text-center">
                    <span className="inline-block bg-green-800 text-green-200 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                      Result: Unstoppable Energy! ⚡
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Funny Truth Bombs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-900 bg-opacity-50 rounded-lg p-4 text-center border border-purple-600 transform hover:scale-105 transition">
                <div className="text-3xl mb-2">🍕➡️🥗</div>
                <p className="text-purple-200 text-sm font-semibold">
                  "Your body is not a trash can. Stop putting garbage in it!"
                </p>
              </div>
              <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 text-center border border-blue-600 transform hover:scale-105 transition">
                <div className="text-3xl mb-2">🧠💡</div>
                <p className="text-blue-200 text-sm font-semibold">
                  "You are what you eat. Don't be fast, cheap, easy or fake!"
                </p>
              </div>
              <div className="bg-pink-900 bg-opacity-50 rounded-lg p-4 text-center border border-pink-600 transform hover:scale-105 transition">
                <div className="text-3xl mb-2">💰🏥</div>
                <p className="text-pink-200 text-sm font-semibold">
                  "Invest in groceries now, or pay hospital bills later. Your choice!"
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-yellow-200 text-lg font-bold animate-pulse">
                🎯 It's not a diet. It's a lifestyle upgrade! 🚀
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 rounded-lg p-6">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-white mb-2">AI-Powered Intelligence</h3>
            <p className="text-blue-200 text-sm">
              Automatic duplicate detection and intelligent calorie estimation using multi-layered AI system
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-700 rounded-lg p-6">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-bold text-white mb-2">Multi-Cuisine Support</h3>
            <p className="text-green-200 text-sm">
              7+ cuisines including Indian (Gujarati, Punjabi, South Indian), Chinese, Italian, and Continental
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-700 rounded-lg p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-white mb-2">Cost Optimized</h3>
            <p className="text-purple-200 text-sm">
              95% free analysis using local intelligence, only ~$0.20 per 1000 meals with Nutritionix API
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-900 to-orange-800 border border-orange-700 rounded-lg p-6">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-white mb-2">Weekly Planning</h3>
            <p className="text-orange-200 text-sm">
              Generate complete 7-day meal plans with breakfast, lunch, and dinner for optimal variety
            </p>
          </div>

          <div className="bg-gradient-to-br from-pink-900 to-pink-800 border border-pink-700 rounded-lg p-6">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">Personalized Preferences</h3>
            <p className="text-pink-200 text-sm">
              Customize by cuisine, meal type, and taste profile (mild, spicy, sweet) for each meal time
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 border border-indigo-700 rounded-lg p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Nutrition Tracking</h3>
            <p className="text-indigo-200 text-sm">
              Track weekly calories, daily averages, health scores, and meal history with detailed analytics
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Planning?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Create your account and get personalized meal recommendations in minutes
          </p>

          {!showAddUser ? (
            <button
              onClick={() => setShowAddUser(true)}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 shadow-lg"
            >
              Get Started - It's Free!
            </button>
          ) : (
            <div className="max-w-md mx-auto bg-white rounded-lg p-6">
              <h3 className="text-gray-800 text-xl font-bold mb-4">Create Your Account</h3>
              <input
                type="text"
                placeholder="Enter your name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && newUserName.trim() && createNewUser()}
                autoFocus
                className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-lg mb-4 border-2 border-gray-300 focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={createNewUser}
                  disabled={!newUserName.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition"
                >
                  Create Account
                </button>
                <button
                  onClick={() => { setShowAddUser(false); setNewUserName(''); }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-6 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            ✨ Powered by Intelligent Multi-Layered AI • 🔒 Privacy-Focused • 💚 Free to Use
          </p>
        </div>
      </div>
    </div>
  );

  // New User Setup Screen
  const SetupNewUserScreen = () => {
    // Step 1: Select Meal Times
    if (setupStep === 1) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome, {currentUser}! 👋</h1>
            <p className="text-gray-400 mb-8">Let's set up your meal preferences. Step 1: Select meal times</p>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">⏰ Which meals do you want to plan?</h2>
              <div className="grid grid-cols-3 gap-3">
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
                disabled={selectedMealTypes.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Step 2: For each meal, select cuisines and tastes
    if (setupStep === 2) {
      const toggleCuisineForMealType = (mealType, cuisine) => {
        setSelectedTastesByMealType(prev => {
          const current = prev[mealType] || { cuisines: [], tastes: [] };
          const cuisines = current.cuisines || [];
          const newCuisines = cuisines.includes(cuisine)
            ? cuisines.filter(c => c !== cuisine)
            : [...cuisines, cuisine];
          return { ...prev, [mealType]: { ...current, cuisines: newCuisines } };
        });
      };

      const toggleTasteForMealType = (mealType, taste) => {
        setSelectedTastesByMealType(prev => {
          const current = prev[mealType] || { cuisines: [], tastes: [] };
          const tastes = current.tastes || [];
          const newTastes = tastes.includes(taste)
            ? tastes.filter(t => t !== taste)
            : [...tastes, taste];
          return { ...prev, [mealType]: { ...current, tastes: newTastes } };
        });
      };

      const allMealsConfigured = selectedMealTypes.every(mealType => {
        const config = selectedTastesByMealType[mealType];
        return config && config.cuisines && config.cuisines.length > 0 && config.tastes && config.tastes.length > 0;
      });

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">Step 2: Customize Each Meal</h1>
            <p className="text-gray-400 mb-8">Select cuisines and taste preferences for each meal type</p>

            <div className="space-y-6 mb-6">
              {selectedMealTypes.map(mealType => {
                const config = selectedTastesByMealType[mealType] || { cuisines: [], tastes: [] };
                return (
                  <div key={mealType} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">{mealType}</h2>

                    {/* Cuisines */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white mb-3">🌍 Cuisines</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {cuisines.map(cuisine => (
                          <button
                            key={cuisine}
                            onClick={() => toggleCuisineForMealType(mealType, cuisine)}
                            className={`p-3 rounded-lg font-semibold transition text-sm text-left ${
                              config.cuisines.includes(cuisine)
                                ? 'bg-blue-600 text-white border-2 border-blue-500'
                                : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-blue-500'
                            }`}
                          >
                            {cuisine.replace('Indian - ', '')}
                            {config.cuisines.includes(cuisine) && ' ✓'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tastes */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">🌶️ Taste Preferences</h3>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => toggleTasteForMealType(mealType, 'mild')}
                          className={`p-3 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2 ${
                            config.tastes.includes('mild')
                              ? 'bg-blue-600 text-white border-2 border-blue-500'
                              : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-blue-500'
                          }`}
                        >
                          <Leaf size={16} /> Mild
                        </button>
                        <button
                          onClick={() => toggleTasteForMealType(mealType, 'spicy')}
                          className={`p-3 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2 ${
                            config.tastes.includes('spicy')
                              ? 'bg-orange-600 text-white border-2 border-orange-500'
                              : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-orange-500'
                          }`}
                        >
                          <Flame size={16} /> Spicy
                        </button>
                        <button
                          onClick={() => toggleTasteForMealType(mealType, 'sweet')}
                          className={`p-3 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2 ${
                            config.tastes.includes('sweet')
                              ? 'bg-pink-600 text-white border-2 border-pink-500'
                              : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-pink-500'
                          }`}
                        >
                          <ChefHat size={16} /> Sweet
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 sticky bottom-6">
              <button
                onClick={() => setSetupStep(1)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setSetupStep(3)}
                disabled={!allMealsConfigured}
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

      // Group meals by meal type
      const mealsByType = {
        Breakfast: curatedMeals.filter(m => m.type === 'Breakfast'),
        Lunch: curatedMeals.filter(m => m.type === 'Lunch'),
        Dinner: curatedMeals.filter(m => m.type === 'Dinner')
      };

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">Step 3: Your Curated Meals</h1>
            <p className="text-gray-400 mb-8">Based on your preferences, here are your meals organized by meal type</p>

            <div className="space-y-6 mb-6">
              {selectedMealTypes.map(mealType => {
                const meals = mealsByType[mealType] || [];
                return (
                  <div key={mealType} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {mealType === 'Breakfast' && '🌅'}
                        {mealType === 'Lunch' && '🍽️'}
                        {mealType === 'Dinner' && '🌙'}
                        {mealType}
                      </h2>
                      <span className="text-gray-400 text-sm">{meals.length} items</span>
                    </div>

                    {meals.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {meals.map((meal, idx) => (
                          <div key={idx} className="bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-500 transition">
                            <p className="text-white font-semibold text-sm">{meal.name}</p>
                            <p className="text-gray-400 text-xs mt-1">⚡ {meal.calories} cal</p>
                            <div className="flex items-center gap-1 mt-2">
                              {meal.taste === 'mild' && <span className="text-blue-400 text-xs">🌿 Mild</span>}
                              {meal.taste === 'spicy' && <span className="text-orange-400 text-xs">🔥 Spicy</span>}
                              {meal.taste === 'sweet' && <span className="text-pink-400 text-xs">🍰 Sweet</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No meals available for this type with your selected preferences</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-blue-200 text-sm">
                ℹ️ <strong>Total: {curatedMeals.length} meals</strong> - These will be used to generate your weekly meal plans. You can always add custom meals later!
              </p>
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
  const ProfileScreen = () => {
    const userCuisines = users[currentUser]?.cuisines || [];
    const userMealTypes = users[currentUser]?.mealTypes || [];
    const userTastes = users[currentUser]?.tastes || [];

    return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Your Profile</h1>

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

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Your Preferences</h2>
        <div className="space-y-4">
          {userCuisines.length > 0 && (
            <div>
              <p className="text-gray-400 text-sm mb-2">Preferred Cuisines</p>
              <div className="flex flex-wrap gap-2">
                {userCuisines.map(cuisine => (
                  <span key={cuisine} className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm">
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
          )}
          {userMealTypes.length > 0 && (
            <div>
              <p className="text-gray-400 text-sm mb-2">Meal Types</p>
              <div className="flex flex-wrap gap-2">
                {userMealTypes.map(type => (
                  <span key={type} className="bg-green-900 text-green-200 px-3 py-1 rounded-full text-sm">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
          {userTastes.length > 0 && (
            <div>
              <p className="text-gray-400 text-sm mb-2">Taste Preferences</p>
              <div className="flex flex-wrap gap-2">
                {userTastes.map(taste => (
                  <span key={taste} className="bg-purple-900 text-purple-200 px-3 py-1 rounded-full text-sm capitalize">
                    {taste}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Intelligence Stats */}
      {intelligenceStats.totalAnalyses > 0 && (
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={24} /> AI Intelligence Stats
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-purple-800 bg-opacity-50 p-4 rounded-lg">
              <p className="text-purple-200 text-sm">Total Analyses</p>
              <p className="text-3xl font-bold text-white">{intelligenceStats.totalAnalyses}</p>
            </div>
            <div className="bg-purple-800 bg-opacity-50 p-4 rounded-lg">
              <p className="text-purple-200 text-sm">Total Cost</p>
              <p className="text-3xl font-bold text-green-400">${intelligenceStats.totalCost.toFixed(4)}</p>
            </div>
            <div className="bg-purple-800 bg-opacity-50 p-4 rounded-lg">
              <p className="text-purple-200 text-sm">Avg Cost/Meal</p>
              <p className="text-3xl font-bold text-white">
                ${(intelligenceStats.totalCost / intelligenceStats.totalAnalyses).toFixed(4)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-purple-200 text-sm mb-2">Analysis Methods Used:</p>
            <div className="space-y-2">
              {Object.entries(intelligenceStats.methodBreakdown).map(([method, count]) => (
                <div key={method} className="flex justify-between items-center bg-purple-800 bg-opacity-30 p-2 rounded">
                  <span className="text-purple-100 text-sm capitalize">{method.replace(/_/g, ' ')}</span>
                  <span className="text-white font-semibold">{count} times</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-900 bg-opacity-50 rounded-lg">
            <p className="text-blue-200 text-xs">
              💡 <strong>Cost Optimization:</strong> {
                intelligenceStats.totalCost === 0
                  ? 'All analyses were FREE! Using local intelligence & Nutritionix free tier.'
                  : `You've spent only $${intelligenceStats.totalCost.toFixed(4)} total. That's less than a penny per meal!`
              }
            </p>
          </div>
        </div>
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
                        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-3 rounded border border-gray-600 relative group">
                          <p className="text-white font-semibold text-sm">{userWeek[day][mealType].name}</p>
                          <p className="text-gray-400 text-xs mt-1">⚡ {userWeek[day][mealType].calories} cal</p>
                          <button
                            onClick={() => handleEditMeal(day, mealType)}
                            className="absolute top-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditMeal(day, mealType)}
                          className="text-gray-500 hover:text-blue-400 text-sm flex items-center gap-1"
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
    const [selectedPlan, setSelectedPlan] = useState(null);

    const viewPlan = (plan) => {
      setSelectedPlan(plan);
    };

    const closePlanView = () => {
      setSelectedPlan(null);
    };

    const loadPlan = (plan) => {
      setMeals(prev => ({
        ...prev,
        [currentUser]: plan.week
      }));
      setCurrentScreen('planner');
    };

    // Calculate plan calories
    const calculatePlanCalories = (week) => {
      let total = 0;
      Object.values(week).forEach(day => {
        Object.values(day).forEach(meal => {
          if (meal) total += meal.calories;
        });
      });
      return total;
    };

    return (
      <div className="p-6 max-w-6xl mx-auto">
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
            {[...userPlans].reverse().map((plan, idx) => {
              const totalCalories = calculatePlanCalories(plan.week);
              const mealCount = Object.values(plan.week).reduce((count, day) =>
                count + Object.values(day).filter(m => m).length, 0
              );

              return (
                <div
                  key={plan.id}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-bold text-xl">Week Plan #{userPlans.length - idx}</h3>
                      <p className="text-gray-400 text-sm">Generated: {plan.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Total Meals</p>
                      <p className="text-2xl font-bold text-blue-400">{mealCount}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <p className="text-gray-400 text-xs">Weekly Calories</p>
                      <p className="text-xl font-bold text-green-400">{totalCalories.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <p className="text-gray-400 text-xs">Daily Average</p>
                      <p className="text-xl font-bold text-purple-400">{Math.round(totalCalories / 7)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => viewPlan(plan)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <Calendar size={16} /> View Details
                    </button>
                    <button
                      onClick={() => loadPlan(plan)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <ChevronRight size={16} /> Load to Planner
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Plan Detail Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Weekly Plan Details</h2>
                  <p className="text-gray-400">Generated: {selectedPlan.date}</p>
                </div>
                <button onClick={closePlanView} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="bg-gray-800 text-white p-3 text-left border border-gray-700">Day</th>
                      <th className="bg-gray-800 text-white p-3 text-left border border-gray-700">Morning</th>
                      <th className="bg-gray-800 text-white p-3 text-left border border-gray-700">Lunch</th>
                      <th className="bg-gray-800 text-white p-3 text-left border border-gray-700">Dinner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map(day => (
                      <tr key={day}>
                        <td className="bg-gray-800 text-white p-3 border border-gray-700 font-semibold">{day}</td>
                        {['morning', 'lunch', 'dinner'].map(mealType => (
                          <td key={`${day}-${mealType}`} className="bg-gray-900 p-3 border border-gray-700">
                            {selectedPlan.week[day] && selectedPlan.week[day][mealType] ? (
                              <div>
                                <p className="text-white font-semibold text-sm">
                                  {selectedPlan.week[day][mealType].name}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  ⚡ {selectedPlan.week[day][mealType].calories} cal
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-600 text-sm">-</p>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => loadPlan(selectedPlan)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Load to Current Planner
                </button>
                <button
                  onClick={closePlanView}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const toggleMealTypeSelection = (mealType) => {
    setCustomMealData(prev => ({
      ...prev,
      mealTypes: prev.mealTypes.includes(mealType)
        ? prev.mealTypes.filter(t => t !== mealType)
        : [...prev.mealTypes, mealType]
    }));
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

          {/* Custom Meal Popup */}
          {showCustomMealPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">Add Custom Meal</h2>
                  <button onClick={handleCloseCustomMealPopup} className="text-gray-400 hover:text-white">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Meal Name */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Meal Name *</label>
                    <input
                      type="text"
                      value={customMealData.name}
                      onChange={(e) => setCustomMealData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Grilled Veggie Salad"
                      autoFocus
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* AI Analysis Button */}
                  <div className="bg-blue-900 border border-blue-700 rounded-lg p-3">
                    <button
                      onClick={handleAnalyzeMeal}
                      disabled={isAnalyzing || !customMealData.name}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Analyze with AI
                        </>
                      )}
                    </button>
                    <p className="text-blue-300 text-xs mt-2 text-center">
                      🎯 AI will detect duplicates & estimate calories
                    </p>
                  </div>

                  {/* Analysis Result */}
                  {analysisResult && (
                    <div className={`p-3 rounded-lg border ${
                      analysisResult.isDuplicate
                        ? 'bg-red-900 border-red-700'
                        : 'bg-green-900 border-green-700'
                    }`}>
                      {analysisResult.isDuplicate ? (
                        <div className="flex items-start gap-2">
                          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-red-200 font-semibold">Duplicate Detected!</p>
                            <p className="text-red-300 text-sm">
                              Similar to "{analysisResult.matchedMeal}" ({analysisResult.confidence}% match)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-green-200 font-semibold">Analysis Complete</p>
                            <p className="text-green-300 text-sm">
                              Estimated: {analysisResult.calories} cal ({analysisResult.confidence}% confidence)
                            </p>
                            <p className="text-green-400 text-xs mt-1">
                              Method: {analysisResult.method}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Calories */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Calories {analysisResult ? '(auto-filled)' : '*'}
                    </label>
                    <input
                      type="number"
                      value={customMealData.calories}
                      onChange={(e) => setCustomMealData(prev => ({ ...prev, calories: e.target.value }))}
                      placeholder={analysisResult ? `Suggested: ${analysisResult.calories}` : "e.g., 450 (or use AI analysis)"}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
                    />

                    {/* Macronutrient Breakdown */}
                    {analysisResult && analysisResult.details && (
                      <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <p className="text-gray-400 text-xs font-semibold mb-2">Macronutrient Breakdown:</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <p className="text-blue-400 text-lg font-bold">{analysisResult.details.protein}g</p>
                            <p className="text-gray-500 text-xs">Protein</p>
                          </div>
                          <div className="text-center">
                            <p className="text-green-400 text-lg font-bold">{analysisResult.details.carbs}g</p>
                            <p className="text-gray-500 text-xs">Carbs</p>
                          </div>
                          <div className="text-center">
                            <p className="text-yellow-400 text-lg font-bold">{analysisResult.details.fat}g</p>
                            <p className="text-gray-500 text-xs">Fat</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cuisine */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Cuisine *</label>
                    <select
                      value={customMealData.cuisine}
                      onChange={(e) => setCustomMealData(prev => ({ ...prev, cuisine: e.target.value }))}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
                    >
                      {cuisines.map(cuisine => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                  </div>

                  {/* Meal Type */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Meal Type * (select one or more)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {mealTypes.map(mealType => (
                        <button
                          key={mealType}
                          onClick={() => toggleMealTypeSelection(mealType)}
                          className={`p-2 rounded-lg font-semibold transition text-sm ${
                            customMealData.mealTypes.includes(mealType)
                              ? 'bg-blue-600 text-white border-2 border-blue-500'
                              : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-blue-500'
                          }`}
                        >
                          {mealType}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Taste */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Taste Preference *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {tastes.map(taste => (
                        <button
                          key={taste}
                          onClick={() => setCustomMealData(prev => ({ ...prev, taste }))}
                          className={`p-2 rounded-lg font-semibold transition text-sm capitalize ${
                            customMealData.taste === taste
                              ? 'bg-blue-600 text-white border-2 border-blue-500'
                              : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-blue-500'
                          }`}
                        >
                          {taste}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCustomMealPopup(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCustomMeal}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition"
                  >
                    Save Meal
                  </button>
                </div>
              </div>
            </div>
          )}

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