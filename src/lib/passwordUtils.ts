// Password strength validation utility

export interface PasswordStrength {
  score: number; // 0-4 (0=very weak, 4=very strong)
  feedback: string[];
  isValid: boolean;
}

export const validatePassword = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Check minimum length
  if (password.length < 6) {
    feedback.push('Password must be at least 6 characters long');
    return { score: 0, feedback, isValid: false };
  }

  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Common password check
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    'dragon', 'master', 'hello', 'freedom', 'whatever',
    'qazwsx', 'trustno1', 'jordan', 'harley', 'ranger',
    'joshua', 'maggie', 'computer', 'amanda', 'summer',
    'love', 'ashley', 'nicole', 'chelsea', 'biteme',
    'matthew', 'access', 'yankees', '987654321', 'dallas',
    'austin', 'thunder', 'taylor', 'matrix', 'mobilemail',
    'mom', 'monitor', 'monitoring', 'montana', 'moon',
    'moscow', 'mother', 'movie', 'mozilla', 'music',
    'mustang', 'password', 'pa$$w0rd', 'p@ssw0rd', 'p@$$w0rd'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    feedback.push('This is a commonly used password. Please choose something more unique.');
    score = Math.max(0, score - 2);
  }

  // Provide feedback based on score
  if (score < 2) {
    feedback.push('Consider adding uppercase letters, numbers, or special characters');
  }
  if (password.length < 8) {
    feedback.push('Consider making your password longer (8+ characters)');
  }

  // Determine if password is valid (minimum requirements met)
  const isValid = password.length >= 6 && score >= 2;

  return { score, feedback, isValid };
};

export const getPasswordStrengthText = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'Very Weak';
    case 2:
      return 'Weak';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    case 5:
    case 6:
      return 'Very Strong';
    default:
      return 'Unknown';
  }
};

export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'text-red-600';
    case 2:
      return 'text-orange-600';
    case 3:
      return 'text-yellow-600';
    case 4:
      return 'text-blue-600';
    case 5:
    case 6:
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
}; 