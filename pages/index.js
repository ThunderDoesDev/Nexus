import PermissionsCalculator from "@/components/PermissionsCalculator";
import NexusHeader from "@/components/header";
import NexusFooter from "@/components/footer";

export default function Permissions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900">
      <NexusHeader />
      <main className="w-full max-w-7xl mx-auto px-4 pt-8 pb-8">
        <PermissionsCalculator />
        <NexusFooter />
      </main>
    </div>
  );
}
