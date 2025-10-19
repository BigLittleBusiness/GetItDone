/**
 * Normalize user object from API to match frontend expectations
 */
export const normalizeUser = (apiUser) => {
  if (!apiUser) return null;

  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    roles: Array.isArray(apiUser.roles) ? apiUser.roles : (apiUser.roles ? JSON.parse(apiUser.roles) : []),
    primaryRole: apiUser.primaryRole || 'student',
    currentContext: apiUser.currentContext || apiUser.primaryRole || 'student',
    experienceLevel: apiUser.experienceLevel || 'beginner',
    motivationStyle: apiUser.motivationStyle || 'positive',
    isAutistic: apiUser.isAutistic || false,
    interests: Array.isArray(apiUser.interests) ? apiUser.interests : (apiUser.interests ? JSON.parse(apiUser.interests) : []),
    gamingPreferences: apiUser.gamingPreferences ? (typeof apiUser.gamingPreferences === 'string' ? JSON.parse(apiUser.gamingPreferences) : apiUser.gamingPreferences) : null,
    educationLevel: apiUser.educationLevel,
    parentDetails: apiUser.parentDetails ? (typeof apiUser.parentDetails === 'string' ? JSON.parse(apiUser.parentDetails) : apiUser.parentDetails) : null,
    professionalDetails: apiUser.professionalDetails ? (typeof apiUser.professionalDetails === 'string' ? JSON.parse(apiUser.professionalDetails) : apiUser.professionalDetails) : null,
    calendarPreferences: apiUser.calendarPreferences ? (typeof apiUser.calendarPreferences === 'string' ? JSON.parse(apiUser.calendarPreferences) : apiUser.calendarPreferences) : null,
    notificationPreferences: apiUser.notificationPreferences ? (typeof apiUser.notificationPreferences === 'string' ? JSON.parse(apiUser.notificationPreferences) : apiUser.notificationPreferences) : { frequency: 'normal' },
    coreOnboardingComplete: apiUser.coreOnboardingComplete !== undefined ? apiUser.coreOnboardingComplete : true,
    progressiveOnboardingComplete: apiUser.progressiveOnboardingComplete || false,
    tourComplete: apiUser.tourComplete || false,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
  };
};

/**
 * Prepare user object for API submission
 */
export const prepareUserForAPI = (user) => {
  return {
    email: user.email,
    name: user.name,
    roles: user.roles,
    primaryRole: user.primaryRole,
    currentContext: user.currentContext,
    experienceLevel: user.experienceLevel,
    motivationStyle: user.motivationStyle,
    isAutistic: user.isAutistic,
    interests: user.interests,
    gamingPreferences: user.gamingPreferences,
    educationLevel: user.educationLevel,
    parentDetails: user.parentDetails,
    professionalDetails: user.professionalDetails,
    calendarPreferences: user.calendarPreferences,
    notificationPreferences: user.notificationPreferences,
  };
};

