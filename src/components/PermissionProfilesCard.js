import { Card } from './ui/card';
import { Button } from './ui/button';

const permissionProfiles = {
  music: {
    name: 'Music Bot',
    icon: '🎵',
    description: 'Perfect for music playback bots',
    permissions: [
      'CONNECT',
      'SPEAK',
      'USE_VAD',
      'PRIORITY_SPEAKER',
      'READ_MESSAGE_HISTORY',
      'SEND_MESSAGES',
      'EMBED_LINKS',
      'ATTACH_FILES'
    ],
    color: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
  },
  tickets: {
    name: 'Ticket System',
    icon: '🎫',
    description: 'For ticket and support management bots',
    permissions: [
      'MANAGE_CHANNELS',
      'MANAGE_ROLES',
      'SEND_MESSAGES',
      'EMBED_LINKS',
      'ATTACH_FILES',
      'READ_MESSAGE_HISTORY',
      'ADD_REACTIONS'
    ],
    color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
  },
  moderation: {
    name: 'Moderation Bot',
    icon: '🛡️',
    description: 'Complete moderation and server management',
    permissions: [
      'KICK_MEMBERS',
      'BAN_MEMBERS',
      'ADMINISTRATOR',
      'MANAGE_CHANNELS',
      'MANAGE_ROLES',
      'MANAGE_GUILD',
      'VIEW_AUDIT_LOG',
      'READ_MESSAGE_HISTORY',
      'SEND_MESSAGES'
    ],
    color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
  },
  utility: {
    name: 'Utility Bot',
    icon: '🔧',
    description: 'General purpose utility commands',
    permissions: [
      'SEND_MESSAGES',
      'EMBED_LINKS',
      'ATTACH_FILES',
      'READ_MESSAGE_HISTORY',
      'ADD_REACTIONS',
      'USE_EXTERNAL_EMOJIS'
    ],
    color: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
  },
  gaming: {
    name: 'Gaming Bot',
    icon: '🎮',
    description: 'For gaming and entertainment features',
    permissions: [
      'SEND_MESSAGES',
      'EMBED_LINKS',
      'ATTACH_FILES',
      'READ_MESSAGE_HISTORY',
      'ADD_REACTIONS',
      'USE_EXTERNAL_EMOJIS',
      'CONNECT',
      'SPEAK'
    ],
    color: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
  },
  logging: {
    name: 'Logging Bot',
    icon: '📝',
    description: 'Server logging and analytics',
    permissions: [
      'VIEW_AUDIT_LOG',
      'READ_MESSAGE_HISTORY',
      'SEND_MESSAGES',
      'EMBED_LINKS',
      'ATTACH_FILES',
      'MANAGE_WEBHOOKS'
    ],
    color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
  },
  economy: {
    name: 'Economy Bot',
    icon: '💰',
    description: 'Currency and economy systems',
    permissions: [
      'SEND_MESSAGES',
      'EMBED_LINKS',
      'ATTACH_FILES',
      'READ_MESSAGE_HISTORY',
      'ADD_REACTIONS',
      'USE_EXTERNAL_EMOJIS'
    ],
    color: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
  },
  welcome: {
    name: 'Welcome Bot',
    icon: '👋',
    description: 'Member welcome and onboarding',
    permissions: [
      'MANAGE_CHANNELS',
      'MANAGE_ROLES',
      'SEND_MESSAGES',
      'EMBED_LINKS',
      'ATTACH_FILES',
      'ADD_REACTIONS'
    ],
    color: 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300'
  }
};

export default function PermissionProfilesCard({ onSelectProfile, selectedPermissions }) {
  const handleProfileSelect = (profileKey) => {
    const profile = permissionProfiles[profileKey];
    if (onSelectProfile) {
      onSelectProfile(profile.permissions);
    }
  };

  const handleClear = () => {
    if (onSelectProfile) {
      onSelectProfile([]);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 h-full flex flex-col min-h-0">
      <div className="mb-4 sm:mb-6 flex-shrink-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">
          Permission Profiles
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
          Select a pre-configured permission profile for common bot types
        </p>
      </div>
      
      <div 
        className="flex-1 min-h-0 overflow-y-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 scrollbar-visible"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#94a3b8 rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-4 auto-rows-fr">
          {Object.entries(permissionProfiles).map(([key, profile]) => (
            <Card 
              key={key}
              className="h-full flex flex-col p-3 sm:p-4 md:p-5 cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all border-2 border-slate-300 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 active:border-blue-500 bg-gray-100 dark:bg-slate-700 touch-manipulation"
              onClick={() => handleProfileSelect(key)}
            >
              <div className="flex flex-col h-full gap-2 sm:gap-3">
                <div className="flex items-start gap-2 sm:gap-3 flex-shrink-0">
                  <div className="text-2xl sm:text-3xl md:text-4xl flex-shrink-0">{profile.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                      {profile.name}
                    </h3>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 leading-relaxed flex-1">
                  {profile.description}
                </p>
                <div className={`inline-block px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${profile.color} flex-shrink-0 w-fit`}>
                  {profile.permissions.length} permissions
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
            Click any profile to apply its permissions. You can customize them afterward.
          </p>
          <Button
            onClick={handleClear}
            className="h-10 sm:h-9 px-4 sm:px-4 rounded-lg text-sm font-semibold transition-all bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 active:bg-red-300 dark:active:bg-red-700 whitespace-nowrap w-full sm:w-auto touch-manipulation"
            type="button"
          >
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
}
