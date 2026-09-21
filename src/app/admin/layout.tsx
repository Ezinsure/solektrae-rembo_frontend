"use client";

import TopNav from "../../components/layout/top-bar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="p-6 bg-white max-w-[98%] mx-auto container mt-4 rounded-md min-h-[88vh]">
        {children}
      </main>
    </div>
  );
};
export default AdminLayout;
