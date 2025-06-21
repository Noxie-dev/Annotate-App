import { useMemo } from 'react';
import { Shield, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { securityService } from '@/services/security-service';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
  showFeedback?: boolean;
  className?: string;
}

export function PasswordStrengthIndicator({ 
  password, 
  showFeedback = true, 
  className = '' 
}: PasswordStrengthIndicatorProps) {
  const validation = useMemo(() => {
    if (!password) {
      return {
        isValid: false,
        score: 0,
        feedback: []
      };
    }
    return securityService.validatePasswordStrength(password);
  }, [password]);

  const getStrengthLabel = (score: number) => {
    if (score === 0) return 'No password';
    if (score <= 1) return 'Very weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = (score: number) => {
    if (score === 0) return 'bg-gray-500';
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getTextColor = (score: number) => {
    if (score === 0) return 'text-gray-400';
    if (score <= 1) return 'text-red-400';
    if (score <= 2) return 'text-orange-400';
    if (score <= 3) return 'text-yellow-400';
    if (score <= 4) return 'text-blue-400';
    return 'text-green-400';
  };

  const requirements = [
    { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { label: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'One number', test: (pwd: string) => /[0-9]/.test(pwd) },
    { label: 'One special character', test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd) }
  ];

  if (!password) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar and Label */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Password strength</span>
          <span className={`text-sm font-medium ${getTextColor(validation.score)}`}>
            {getStrengthLabel(validation.score)}
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(validation.score)}`}
            style={{ width: `${(validation.score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showFeedback && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Password Requirements
          </h4>
          
          <div className="space-y-1">
            {requirements.map((requirement, index) => {
              const isMet = requirement.test(password);
              return (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  {isMet ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <X className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={isMet ? 'text-green-400' : 'text-gray-500'}>
                    {requirement.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Additional Feedback */}
          {validation.feedback.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  {validation.feedback.map((feedback, index) => (
                    <p key={index} className="text-sm text-yellow-300">
                      {feedback}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Tips */}
          {validation.score >= 4 && (
            <div className="mt-3 p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-300">
                    Great! Your password meets security requirements.
                  </p>
                  <p className="text-xs text-green-400 mt-1">
                    Consider using a password manager to generate and store unique passwords.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Simplified version for inline use
export function PasswordStrengthBar({ password, className = '' }: { password: string; className?: string }) {
  const validation = useMemo(() => {
    if (!password) return { score: 0 };
    return securityService.validatePasswordStrength(password);
  }, [password]);

  const getStrengthColor = (score: number) => {
    if (score === 0) return 'bg-gray-500';
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = (score: number) => {
    if (score === 0) return '';
    if (score <= 1) return 'Very weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const getTextColor = (score: number) => {
    if (score === 0) return 'text-gray-400';
    if (score <= 1) return 'text-red-400';
    if (score <= 2) return 'text-orange-400';
    if (score <= 3) return 'text-yellow-400';
    if (score <= 4) return 'text-blue-400';
    return 'text-green-400';
  };

  if (!password) {
    return null;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Strength</span>
        <span className={`text-xs ${getTextColor(validation.score)}`}>
          {getStrengthLabel(validation.score)}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1">
        <div
          className={`h-1 rounded-full transition-all duration-300 ${getStrengthColor(validation.score)}`}
          style={{ width: `${(validation.score / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
