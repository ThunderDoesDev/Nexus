
import PermissionsCalculator from "@/components/PermissionsCalculator";
import NexusHeader from "@/components/header";
import NexusFooter from "@/components/footer";

export default function Permissions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900">
      <NexusHeader />
      <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8 pb-4 sm:pb-6 md:pb-8">
        <div className="space-y-0 md:space-y-8">
          <PermissionsCalculator />
          <NexusFooter />
        </div>
      </main>
    </div>
  );
}
