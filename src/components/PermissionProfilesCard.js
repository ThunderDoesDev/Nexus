import { Card } from "./ui/card";
import { Button } from "./ui/button";

const permissionProfiles = {
  music: {
    name: "Music Bot",
    icon: "🎵",
    description: "Perfect for music playback bots",
    permissions: ["CONNECT", "SPEAK", "USE_VAD", "PRIORITY_SPEAKER", "READ_MESSAGE_HISTORY", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES"],
    accent: "from-purple-500/20 to-violet-600/10 border-purple-500/20",
  },
  tickets: {
    name: "Ticket System",
    icon: "🎫",
    description: "For ticket and support management bots",
    permissions: ["MANAGE_CHANNELS", "MANAGE_ROLES", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY", "ADD_REACTIONS"],
    accent: "from-blue-500/20 to-cyan-600/10 border-blue-500/20",
  },
  moderation: {
    name: "Moderation Bot",
    icon: "🛡️",
    description: "Complete moderation and server management",
    permissions: ["KICK_MEMBERS", "BAN_MEMBERS", "ADMINISTRATOR", "MANAGE_CHANNELS", "MANAGE_ROLES", "MANAGE_GUILD", "VIEW_AUDIT_LOG", "READ_MESSAGE_HISTORY", "SEND_MESSAGES"],
    accent: "from-red-500/20 to-rose-600/10 border-red-500/20",
  },
  utility: {
    name: "Utility Bot",
    icon: "🔧",
    description: "General purpose utility commands",
    permissions: ["SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS"],
    accent: "from-emerald-500/20 to-green-600/10 border-emerald-500/20",
  },
  gaming: {
    name: "Gaming Bot",
    icon: "🎮",
    description: "For gaming and entertainment features",
    permissions: ["SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK"],
    accent: "from-indigo-500/20 to-blue-600/10 border-indigo-500/20",
  },
  logging: {
    name: "Logging Bot",
    icon: "📝",
    description: "Server logging and analytics",
    permissions: ["VIEW_AUDIT_LOG", "READ_MESSAGE_HISTORY", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "MANAGE_WEBHOOKS"],
    accent: "from-amber-500/20 to-yellow-600/10 border-amber-500/20",
  },
  economy: {
    name: "Economy Bot",
    icon: "💰",
    description: "Currency and economy systems",
    permissions: ["SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS"],
    accent: "from-teal-500/20 to-cyan-600/10 border-teal-500/20",
  },
  welcome: {
    name: "Welcome Bot",
    icon: "👋",
    description: "Member welcome and onboarding",
    permissions: ["MANAGE_CHANNELS", "MANAGE_ROLES", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "ADD_REACTIONS"],
    accent: "from-pink-500/20 to-rose-600/10 border-pink-500/20",
  },
};

export default function PermissionProfilesCard({ onSelectProfile }) {
  return (
    <div className="p-5 md:p-6 h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-visible">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
          {Object.entries(permissionProfiles).map(([key, profile]) => (
            <Card
              key={key}
              className={`p-4 cursor-pointer group hover:border-[var(--nx-border-accent)] active:scale-[0.98] transition-all bg-gradient-to-br ${profile.accent} border`}
              onClick={() => onSelectProfile?.(profile.permissions)}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl drop-shadow-sm">{profile.icon}</span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[var(--nx-text-heading)] group-hover:text-white transition-colors">
                    {profile.name}
                  </h3>
                  <p className="text-xs text-[var(--nx-text-muted)] mt-1 leading-relaxed">{profile.description}</p>
                  <span className="inline-block mt-2.5 nx-badge">{profile.permissions.length} perms</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-4 border-t border-[var(--nx-border)] flex-shrink-0 flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--nx-text-faint)]">Click a profile to apply instantly</p>
        <Button variant="destructive" size="sm" onClick={() => onSelectProfile?.([])} type="button">
          Clear All
        </Button>
      </div>
    </div>
  );
}
