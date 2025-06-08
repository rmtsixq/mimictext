import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes } from 'react-icons/fa';

const Pricing = () => {
  const plans = [
    {
      name: 'Basic',
      price: 5,
      risk: 20,
      features: [
        'Basic text generation',
        'Standard response time',
        'Limited usage per day',
        'Basic style analysis',
        'Community support'
      ],
      notIncluded: [
        'Priority support',
        'Advanced features',
        'Custom models'
      ]
    },
    {
      name: 'Pro',
      price: 10,
      risk: 10,
      features: [
        'Advanced text generation',
        'Faster response time',
        'Higher daily limit',
        'Advanced style analysis',
        'Priority support',
        'Custom templates'
      ],
      notIncluded: [
        'Custom models',
        'API access'
      ]
    },
    {
      name: 'Enterprise',
      price: 20,
      risk: 0,
      features: [
        'Premium text generation',
        'Instant response time',
        'Unlimited usage',
        'Full style analysis',
        '24/7 priority support',
        'Custom models',
        'API access',
        'Dedicated account manager'
      ],
      notIncluded: []
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-300">
            Select the perfect plan for your needs
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`rounded-lg shadow-lg overflow-hidden backdrop-blur-lg bg-white/10 border border-white/20 ${
                index === 1 ? 'transform scale-105' : ''
              }`}
            >
              <div className="px-6 py-8">
                <h3 className="text-2xl font-semibold text-white text-center">
                  {plan.name}
                </h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-white">${plan.price}</span>
                  <span className="text-base font-medium text-gray-300">/month</span>
                </p>
                <p className="mt-2 text-sm text-gray-300">
                  Detection Risk: {plan.risk}%
                </p>
                <div className="mt-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <div className="flex-shrink-0">
                          <FaCheck className="h-6 w-6 text-green-400" />
                        </div>
                        <p className="ml-3 text-base text-gray-300">{feature}</p>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <div className="flex-shrink-0">
                          <FaTimes className="h-6 w-6 text-red-400" />
                        </div>
                        <p className="ml-3 text-base text-gray-400">{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <button
                    className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                      index === 1
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    } transition-colors duration-200`}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing; 