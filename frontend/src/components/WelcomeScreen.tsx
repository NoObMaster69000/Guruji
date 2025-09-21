import React from 'react';

interface WelcomeScreenProps {
  userName: string | null;
}

const suggestionChips = [
  'Write a first draft',
  'Get advice',
  'Learn something new',
  'Create an image',
  'Make a plan',
  'Brainstorm ideas',
  'Practice a language',
  'Take a quiz',
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userName }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
        {getGreeting()}, {userName || 'User'}
      </h1>
      <p className="text-2xl mt-2 text-gray-600 dark:text-gray-300">What can I help you with today?</p>
      <div className="flex flex-wrap justify-center mt-8 gap-3">
        {suggestionChips.map((chip) => (
          <button
            key={chip}
            className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
};
