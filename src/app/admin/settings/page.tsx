'use client';

import { useGetAllUsers } from "@/hooks/useUser";

const SettingsView = () => {
    const { data: userData, isLoading: userLoading } =
        useGetAllUsers();
    console.log('userData', userData)

    return (
        <div>
            <h1 className="text-2xl font-medium">Settings</h1>
            <p className="text-muted-foreground ">
                Manage All Users.
            </p>
            <div className="py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8">
                    {userData?.data?.map((u: any) => {
                        return (
                            // eslint-disable-next-line react/jsx-key
                            <div className=" rounded-lg border border-[#E9E9EB] px-6 py-4 relative">
                                <h1 className="uppercase tex-lg mb-2">{u.names}</h1>
                                <p className="text-muted-foreground">{u.email}</p>
                                <p className="text-muted-foreground">{u.phoneNumber}</p>
                                <p className="text-muted-foreground">{u.role}</p>
                                <p className="absolute top-4 right-3 bg-green-400  text-white px-3 py-1 rounded-2xl">{u.isActive ? 'Active' : 'Inactive'}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
export default SettingsView