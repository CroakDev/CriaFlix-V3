'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Globe, Film, Share, ThumbsUp, CheckCircle, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

type FormData = {
  username: string;
  country: string;
  usageFrequency: string;
  referralSource: string;
  wouldRecommend: string;
  extensionInstalled: boolean;
};

type Errors = Partial<Record<keyof FormData, string>>;

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    country: '',
    usageFrequency: '',
    referralSource: '',
    wouldRecommend: '',
    extensionInstalled: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { data: session, status } = useSession();
  const [isButtonExtension, setIsButtonExtension] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const totalSteps = 6;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleSelectChange = (name: keyof typeof formData) => (value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleStartExploring = () => {
    router.push('/home');
  };

  const validateStep = () => {
    const newErrors: Errors = {};
    switch (step) {
      case 1:
        if (!formData.username.trim()) newErrors.username = 'Username is required';
        break;
      case 2:
        if (!formData.country) newErrors.country = 'Please select a country';
        break;
      case 3:
        if (!formData.usageFrequency) newErrors.usageFrequency = 'Please select a frequency';
        break;
      case 4:
        if (!formData.referralSource) newErrors.referralSource = 'Please select a referral source';
        break;
      case 5:
        if (!formData.wouldRecommend) newErrors.wouldRecommend = 'Please select an option';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < totalSteps - 1) {
        setStep((prevStep) => prevStep + 1);
      } else if (step === totalSteps - 1) {
        setStep(totalSteps);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      console.error('No session or user email available');
      return;
    }
  
    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          ...formData,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit the form');
      }
  
      const result = await response.json();
      console.log('Form submitted successfully:', result);
      setIsCompleted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const installExtension = () => {
    window.open('https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm', '_blank')
    setIsButtonExtension(true)
  }
 
  const checkExtensionInstalled = () => {
    // This is a placeholder function. In a real-world scenario,
    // you would implement a method to check if the extension is actually installed.
    // For demonstration purposes, we're simulating a successful check.
    setFormData((prevData) => ({ ...prevData, extensionInstalled: true }));
    setErrors((prevErrors) => ({ ...prevErrors, extensionInstalled: '' }));
  };

  const steps = [
    {
      icon: <User className="w-6 h-6" />,
      title: "Choose Your Username",
      description: "This is how others will see you on our platform.",
      content: (
        <div className="space-y-4">
          <Label htmlFor="username" className="text-sm font-medium">What username would you like to be called?</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter your preferred username"
            className="w-full"
          />
          {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
        </div>
      )
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Where Are You From?",
      description: "Help us tailor your experience based on your location.",
      content: (
        <div className="space-y-4">
          <Label htmlFor="country" className="text-sm font-medium">Which country are you from?</Label>
          <Select name="country" onValueChange={handleSelectChange('country')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="br">Brasil</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="au">Australia</SelectItem>
            </SelectContent>
          </Select>
          {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
        </div>
      )
    },
    {
      icon: <Film className="w-6 h-6" />,
      title: "Your Viewing Habits",
      description: "Let us know how often you enjoy films and series.",
      content: (
        <div className="space-y-4">
          <Label className="text-sm font-medium">How often do you use film and series websites?</Label>
          <RadioGroup name="usageFrequency" onValueChange={handleSelectChange('usageFrequency')} className="space-y-2">
            {['Daily', 'Weekly', 'Monthly', 'Rarely'].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option.toLowerCase()} id={option.toLowerCase()} />
                <Label htmlFor={option.toLowerCase()} className="text-sm">{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.usageFrequency && <p className="text-sm text-red-500">{errors.usageFrequency}</p>}
        </div>
      )
    },
    {
      icon: <Share className="w-6 h-6" />,
      title: "How Did You Find Us?",
      description: "We'd love to know how you discovered our platform.",
      content: (
        <div className="space-y-4">
          <Label htmlFor="referralSource" className="text-sm font-medium">Where did you find out about our platform?</Label>
          <Select name="referralSource" onValueChange={handleSelectChange('referralSource')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select referral source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="search">Search Engine</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
              <SelectItem value="friend">Friend Recommendation</SelectItem>
              <SelectItem value="ad">Advertisement</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.referralSource && <p className="text-sm text-red-500">{errors.referralSource}</p>}
        </div>
      )
    },
    {
      icon: <ThumbsUp className="w-6 h-6" />,
      title: "Would You Recommend Us?",
      description: "Your opinion matters to us!",
      content: (
        <div className="space-y-4">
          <Label className="text-sm font-medium">Would you recommend our platform to someone?</Label>
          <RadioGroup name="wouldRecommend" onValueChange={handleSelectChange('wouldRecommend')} className="space-y-2">
            {['Yes, definitely', 'Maybe', 'No, not really'].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option.toLowerCase()} id={option.toLowerCase()} />
                <Label htmlFor={option.toLowerCase()} className="text-sm">{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.wouldRecommend && <p className="text-sm text-red-500">{errors.wouldRecommend}</p>}
        </div>
      )
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Install Our Extension",
      description: "Enhance your experience and avoid unwanted ads.",
      content: (
        <div className="space-y-4">
          <Label className="text-sm font-medium">Install our extension to block unwanted ads and improve your browsing experience.</Label>
          <p className="text-sm text-gray-500">Click the button below to install the extension, then click Check Installation to verify.</p>
          <div className="space-y-2">
            <Button onClick={installExtension} className="w-full">
              Install Extension
            </Button>
            <Button disabled={!isButtonExtension} onClick={checkExtensionInstalled} variant="outline" className="w-full bg-white bg-opacity-5 hover:bg-background">
              Check Installation
            </Button>
          </div>
          {formData.extensionInstalled && (
            <p className="text-sm text-green-500">Extension successfully installed!</p>
          )}
          {errors.extensionInstalled && <p className="text-sm text-red-500">{errors.extensionInstalled}</p>}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {isCompleted && <Confetti width={dimensions.width} height={dimensions.height} recycle={false} numberOfPieces={200} />}
      <main className="flex-grow bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-secondary rounded-2xl shadow-lg p-8 text-center space-y-6"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold">Welcome Aboard!</h2>
                <p className="text-gray-600">Your account has been created successfully, {formData.username}.</p>
                <Button className="w-full" onClick={handleStartExploring}>Start Exploring</Button>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-secondary rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-8 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      {steps[step - 1].icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{steps[step - 1].title}</h2>
                      <p className="text-sm text-gray-500">{steps[step - 1].description}</p>
                    </div>
                  </div>
                  {steps[step - 1].content}
                </div>
                <div className="px-8 py-4 bg-zinc-700/15 flex justify-between items-center">
                  <div className="text-sm text-gray-500">Step {step} of {totalSteps}</div>
                  <Button
                    onClick={handleNext}
                    className="w-32"
                    disabled={step === totalSteps && !formData.extensionInstalled}
                  >
                    {step < totalSteps ? 'Continue' : 'Finish'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      {!isCompleted && (
        <footer className="p-4 bg-background">
          <div className="w-full max-w-md mx-auto bg-secondary rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 ease-in-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </footer>
      )}
    </div>
  );
}
