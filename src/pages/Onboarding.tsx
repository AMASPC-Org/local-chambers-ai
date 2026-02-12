import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Sparkles, Building2, FileText, Send, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Types ---

interface OnboardingData {
  businessName: string;
  industry: string;
  employees: string;
  goals: string[];
  contactName: string;
  email: string;
}

// --- Steps Components ---

const StepWelcome = ({ onNext }: { onNext: () => void }) => (
  <div className="text-center space-y-6">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-20 h-20 bg-chamber-navy rounded-2xl mx-auto flex items-center justify-center shadow-xl"
    >
      <Sparkles className="w-10 h-10 text-chamber-gold" />
    </motion.div>
    <h2 className="text-3xl font-serif font-bold text-chamber-navy">Let's find your perfect network.</h2>
    <p className="text-slate-600 max-w-md mx-auto text-lg">
      We'll curate a list of local chambers that align with your business goals, industry, and values.
    </p>
    <button onClick={onNext} className="bg-chamber-navy text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
      Start the Journey
    </button>
  </div>
);

const StepBusinessInfo = ({ data, updateData, onNext, onBack }: { data: OnboardingData, updateData: (k: keyof OnboardingData, v: any) => void, onNext: () => void, onBack: () => void }) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <h3 className="text-2xl font-serif font-bold text-chamber-navy">Tell us about your business</h3>
      <p className="text-slate-500">This helps us match you with the right community.</p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
        <input
          type="text"
          value={data.businessName}
          onChange={(e) => updateData('businessName', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-chamber-gold focus:ring-2 focus:ring-chamber-gold/20 outline-none transition-all"
          placeholder="e.g. Acme Innovations"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
        <select
          value={data.industry}
          onChange={(e) => updateData('industry', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-chamber-gold focus:ring-2 focus:ring-chamber-gold/20 outline-none transition-all bg-white"
        >
          <option value="">Select an industry...</option>
          <option value="technology">Technology & SaaS</option>
          <option value="retail">Retail & E-commerce</option>
          <option value="hospitality">Hospitality & Tourism</option>
          <option value="services">Professional Services</option>
          <option value="manufacturing">Manufacturing</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Number of Employees</label>
        <select
          value={data.employees}
          onChange={(e) => updateData('employees', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-chamber-gold focus:ring-2 focus:ring-chamber-gold/20 outline-none transition-all bg-white"
        >
          <option value="">Select size...</option>
          <option value="1-10">1-10 (Micro)</option>
          <option value="11-50">11-50 (Small)</option>
          <option value="51-200">51-200 (Medium)</option>
          <option value="201+">201+ (Large)</option>
        </select>
      </div>
    </div>

    <div className="flex justify-between pt-4">
      <button onClick={onBack} className="text-slate-500 font-medium hover:text-chamber-navy px-4 py-2">Back</button>
      <button onClick={onNext} className="bg-chamber-navy text-white px-6 py-2 rounded-full font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const StepGoals = ({ data, updateData, onNext, onBack }: { data: OnboardingData, updateData: (k: keyof OnboardingData, v: any) => void, onNext: () => void, onBack: () => void }) => {
  const toggleGoal = (goal: string) => {
    if (data.goals.includes(goal)) {
      updateData('goals', data.goals.filter(g => g !== goal));
    } else {
      updateData('goals', [...data.goals, goal]);
    }
  };

  const goalsList = [
    { id: 'networking', label: 'Networking & Leads', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'advocacy', label: 'Policy & Advocacy', icon: <Building2 className="w-5 h-5" /> },
    { id: 'visibility', label: 'Brand Visibility', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'resources', label: 'Education & Resources', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-serif font-bold text-chamber-navy">What matters most to you?</h3>
        <p className="text-slate-500">We'll highlight chambers that excel in these areas.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {goalsList.map((goal) => (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`flex items-center gap-3 px-4 py-4 rounded-xl border-2 text-left transition-all ${data.goals.includes(goal.id)
              ? 'border-chamber-gold bg-chamber-gold/5 text-chamber-navy'
              : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
              }`}
          >
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${data.goals.includes(goal.id) ? 'bg-chamber-gold border-chamber-gold text-white' : 'border-slate-300'
              }`}>
              {data.goals.includes(goal.id) && <Check className="w-3 h-3" />}
            </div>
            <span className="font-medium">{goal.label}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="text-slate-500 font-medium hover:text-chamber-navy px-4 py-2">Back</button>
        <button onClick={onNext} className="bg-chamber-navy text-white px-6 py-2 rounded-full font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const StepCompletion = ({ data }: { data: OnboardingData }) => (
  <div className="text-center space-y-6">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center shadow-xl text-white"
    >
      <Check className="w-10 h-10" />
    </motion.div>
    <h2 className="text-3xl font-serif font-bold text-chamber-navy">You're all set!</h2>
    <p className="text-slate-600 max-w-md mx-auto">
      Thanks, {data.contactName || 'Partner'}. Creating your personalized chamber roadmap now.
    </p>

    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-sm mx-auto text-left space-y-3">
      <div className="flex justify-between border-b pb-2">
        <span className="text-slate-500 text-sm">Business</span>
        <span className="font-medium text-chamber-navy">{data.businessName || 'N/A'}</span>
      </div>
      <div className="flex justify-between border-b pb-2">
        <span className="text-slate-500 text-sm">Industry</span>
        <span className="font-medium text-chamber-navy capitalize">{data.industry || 'N/A'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500 text-sm">Focus</span>
        <span className="font-medium text-chamber-navy">{data.goals.length} Selected</span>
      </div>
    </div>

    <Link to="/signup" className="inline-block bg-chamber-gold text-white px-8 py-3 rounded-full font-semibold hover:bg-amber-700 transition-colors shadow-lg">
      Create Account to See Matches
    </Link>
  </div>
);



export const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    businessName: '',
    industry: '',
    employees: '',
    goals: [],
    contactName: '',
    email: '',
  });

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    setDirection(1);
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Progress Bar */}
        {step > 0 && step < 4 && (
          <div className="mb-8">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-chamber-gold"
                initial={{ width: 0 }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
          >
            {step === 0 && <StepWelcome onNext={nextStep} />}
            {step === 1 && <StepBusinessInfo data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
            {step === 2 && <StepGoals data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
            {step === 3 && <StepCompletion data={data} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
