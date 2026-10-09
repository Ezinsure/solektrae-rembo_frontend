import SettingNav from "./SettingNav";


const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col lg:h-[83vh] ">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-medium">Settings</h1>
        <p className="text-muted-foreground">Manage Account Here.</p>
      </div>

      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[15rem_1fr] lg:gap-8 bg-white">
        <aside className="lg:overflow-y-auto">
          <SettingNav />
        </aside>

        <div className="min-h-0 min-w-0 overflow-y-auto rounded-2xl bg-[#E9E9EB]/20 p-5 ">
          {children}
        </div>
      </div>
    </div>
  );
}
export default SettingsLayout