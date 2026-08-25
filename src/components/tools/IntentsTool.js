import { useState } from "react";
import { Button } from "../ui/button";
import { CheckboxIndicator } from "../ui/checkbox";
import { intents, intentCategories, calculateIntents } from "../../lib/intents";
import { ToolSection, StatGrid, StatCard } from "../ToolPanel";
import { cn } from "@/lib/utils";

const RECOMMENDED = ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"];

export default function IntentsTool() {
  const [selectedIntents, setSelectedIntents] = useState(["GUILDS"]);

  const toggleIntent = (key) => {
    setSelectedIntents((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      const intent = intents[key];
      if (intent.requires) {
        const added = !prev.includes(key);
        if (added) {
          intent.requires.forEach((req) => {
            if (!next.includes(req)) next.push(req);
          });
        }
      }
      if (!next.includes("GUILD_MEMBERS")) {
        return next.filter((k) => k !== "GUILD_PRESENCES");
      }
      return next;
    });
  };

  const toggleCategory = (categoryIntents) => {
    const allSelected = categoryIntents.every((k) => selectedIntents.includes(k));
    if (allSelected) {
      setSelectedIntents(selectedIntents.filter((k) => !categoryIntents.includes(k)));
    } else {
      const merged = [...selectedIntents];
      categoryIntents.forEach((k) => {
        if (!merged.includes(k)) merged.push(k);
      });
      setSelectedIntents(merged);
    }
  };

  const applyRecommended = () => setSelectedIntents([...RECOMMENDED]);
  const allSelected = Object.keys(intents).every((k) => selectedIntents.includes(k));
  const value = calculateIntents(selectedIntents).toString();
  const privilegedCount = selectedIntents.filter((k) => intents[k].privileged).length;

  return (
    <div className="animate-fade-in md:h-full md:min-h-0 flex flex-col gap-3 sm:gap-5 md:overflow-hidden">
      <StatGrid>
        <StatCard label="Intent Value" value={value} accent />
        <StatCard label="Selected" value={selectedIntents.length} />
        <StatCard label="Privileged" value={privilegedCount} />
        <StatCard label="Total Available" value={Object.keys(intents).length} />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={applyRecommended}>
          Recommended starter
        </Button>
        <Button
          variant={allSelected ? "destructive" : "secondary"}
          size="sm"
          onClick={() => setSelectedIntents(allSelected ? [] : Object.keys(intents))}
        >
          {allSelected ? "Clear all" : "Select all"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:flex-1 md:min-h-0 md:overflow-hidden">
        {Object.entries(intentCategories).map(([key, category]) => {
          const catAll = category.intents.every((k) => selectedIntents.includes(k));
          return (
            <ToolSection
              key={key}
              title={category.name}
              fill
              className="md:min-h-0"
              action={
                <button
                  type="button"
                  onClick={() => toggleCategory(category.intents)}
                  className={cn(
                    "text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-1 rounded-md transition-colors whitespace-nowrap",
                    catAll
                      ? "text-[var(--nx-red)] bg-[var(--nx-red-soft)] hover:bg-[var(--nx-red)]/20"
                      : "text-[var(--nx-green)] bg-[var(--nx-green-soft)] hover:bg-[var(--nx-green)]/20"
                  )}
                >
                  {catAll ? "Deselect" : "Select all"}
                </button>
              }
            >
              <div className="space-y-1.5">
                {category.intents.map((intentKey) => {
                  const intent = intents[intentKey];
                  const isSelected = selectedIntents.includes(intentKey);
                  const needsMembers =
                    intentKey === "GUILD_PRESENCES" && !selectedIntents.includes("GUILD_MEMBERS");
                  return (
                    <button
                      key={intentKey}
                      type="button"
                      disabled={needsMembers}
                      onClick={() => toggleIntent(intentKey)}
                      className={cn(
                        "nx-selectable",
                        isSelected && "nx-selectable-active",
                        needsMembers && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <CheckboxIndicator checked={isSelected} className="mt-0.5" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[13px] font-semibold text-[var(--nx-text-heading)]">
                              {intent.name}
                            </p>
                            {intent.privileged && (
                              <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#f0b232]/15 text-[#f0b232]">
                                Privileged
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] sm:text-xs text-[var(--nx-text-muted)] mt-0.5 leading-snug sm:leading-relaxed">
                            {intent.description}
                          </p>
                          {needsMembers && (
                            <p className="text-[11px] text-[var(--nx-red)] mt-1.5 font-medium">
                              Requires Guild Members intent
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ToolSection>
          );
        })}
      </div>
    </div>
  );
}
