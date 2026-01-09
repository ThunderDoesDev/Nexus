import PermissionsCalculator from "@/components/PermissionsCalculator";
import NexusHeader from "@/components/header";
import NexusFooter from "@/components/footer";

export default function Permissions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900">
      <NexusHeader />
      <main className="w-full max-w-7xl mx-auto px-2 pt-6 pb-6 sm:px-4 sm:pt-8 sm:pb-8">
        <PermissionsCalculator />
        <NexusFooter />
      </main>
    </div>
  );
}
