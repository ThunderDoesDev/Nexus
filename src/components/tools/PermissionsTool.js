import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { CheckboxIndicator } from "../ui/checkbox";
import { permissions, permissionsCategories, calculatePermissions } from "../../lib/permissions";
import PermissionProfilesCard from "../PermissionProfilesCard";
import { ToolSection, StatGrid, StatCard } from "../ToolPanel";
import { useNexus } from "../../context/NexusContext";
import { cn } from "@/lib/utils";

export default function PermissionsTool() {
  const { selectedPermissions, setSelectedPermissions, setPermissionValue } = useNexus();
  const [showProfiles, setShowProfiles] = useState(false);

  useEffect(() => {
    const value = calculatePermissions(selectedPermissions);
    setPermissionValue(value.toString());
  }, [selectedPermissions, setPermissionValue]);

  useEffect(() => {
    if (showProfiles) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showProfiles]);

  const togglePermission = (permKey) => {
    if (permKey === "ADMINISTRATOR") {
      setSelectedPermissions(
        !selectedPermissions.includes("ADMINISTRATOR") ? Object.keys(permissions) : []
      );
    } else {
      setSelectedPermissions((prev) =>
        prev.includes(permKey)
          ? prev.filter((p) => p !== permKey && p !== "ADMINISTRATOR")
          : [...prev, permKey]
      );
    }
  };

  const toggleCategory = (categoryPermissions) => {
    const allSelected = categoryPermissions.every((k) => selectedPermissions.includes(k));
    if (allSelected) {
      setSelectedPermissions(selectedPermissions.filter((k) => !categoryPermissions.includes(k)));
    } else {
      setSelectedPermissions([
        ...selectedPermissions,
        ...categoryPermissions.filter((k) => !selectedPermissions.includes(k)),
      ]);
    }
  };

  const allSelected = Object.keys(permissions).every((k) => selectedPermissions.includes(k));
  const value = calculatePermissions(selectedPermissions).toString();

  return (
    <div className="animate-fade-in md:h-full md:min-h-0 flex flex-col gap-3 sm:gap-5 md:overflow-hidden">
      {showProfiles && (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center nx-modal-overlay p-0 sm:p-4"
          onClick={() => setShowProfiles(false)}
        >
          <div
            className="nx-modal max-w-4xl w-full max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden rounded-t-2xl sm:rounded-[var(--nx-radius-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <PermissionProfilesCard
              onSelectProfile={(p) => { setSelectedPermissions(p); setShowProfiles(false); }}
              selectedPermissions={selectedPermissions}
            />
          </div>
        </div>
      )}

      <StatGrid>
        <StatCard label="Decimal Value" value={value} accent />
        <StatCard label="Selected" value={selectedPermissions.length} />
        <StatCard label="Categories" value={Object.keys(permissionsCategories).length} />
        <StatCard label="Total Available" value={Object.keys(permissions).length} />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => setShowProfiles(true)}>
          Profiles
        </Button>
        <Button
          variant={allSelected ? "destructive" : "secondary"}
          size="sm"
          onClick={() => setSelectedPermissions(allSelected ? [] : Object.keys(permissions))}
        >
          {allSelected ? "Clear all" : "Select all"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:flex-1 md:min-h-0 md:overflow-hidden">
        {Object.entries(permissionsCategories).map(([key, category]) => {
          const catAll = category.permissions.every((k) => selectedPermissions.includes(k));
          return (
            <ToolSection
              key={key}
              title={category.name}
              fill
              className="md:min-h-0"
              action={
                <button
                  type="button"
                  onClick={() => toggleCategory(category.permissions)}
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
                {category.permissions.map((permKey) => {
                  const perm = permissions[permKey];
                  if (!perm) return null;
                  const isSelected = selectedPermissions.includes(permKey);
                  const isDisabled = selectedPermissions.includes("ADMINISTRATOR") && permKey !== "ADMINISTRATOR";
                  return (
                    <button
                      key={permKey}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => togglePermission(permKey)}
                      className={cn(
                        "nx-selectable",
                        isSelected && "nx-selectable-active",
                        isDisabled && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <CheckboxIndicator checked={isSelected} className="mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[var(--nx-text-heading)]">{perm.name}</p>
                          <p className="text-[11px] sm:text-xs text-[var(--nx-text-muted)] mt-0.5 leading-snug sm:leading-relaxed">{perm.description}</p>
                          {permKey === "ADMINISTRATOR" && (
                            <p className="text-[11px] text-[var(--nx-red)] mt-1.5 font-medium">Grants all permissions</p>
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
