
const SettingsView = () => {

    const allUsers = [
        {
            names: "Thiery Ngoga",
            email: "ti@gmail.com",
            phone: '2345678',
            role: 'admin',
            status: 'Active'
        },
        {
            names: "Cyusa Ngoga",
            email: "ti@gmail.com",
            phone: '2345678',
            role: 'dev',
            status: 'Active'
        },
        {
            names: "Thiery Ngoga",
            email: "ti@gmail.com",
            phone: '2345678',
            role: 'admin',
            status: 'Active'
        }
    ]

    return (
        <div>
            <h1 className="text-2xl font-medium">Settings</h1>
            <p className="text-muted-foreground mt-2">
                Manage All Users.
            </p>
            <div className="my-10 px-6">
                <div className="grid grid-cols-4 gap-8">
                    {allUsers?.map((u) => {
                        return (
                            // eslint-disable-next-line react/jsx-key
                            <div className=" rounded-lg border border-[#E9E9EB] px-6 py-4 relative">
                                <h1 className="uppercase tex-lg mb-2">{u.names}</h1>
                                <p className="text-muted-foreground">{u.email}</p>
                                <p className="text-muted-foreground">{u.phone}</p>
                                <p className="text-muted-foreground">{u.role}</p>
                                <p className="absolute top-4 right-3 bg-green-400  text-white px-3 py-1 rounded-2xl">{u.status}</p>
                            </div>
                        )
                    })}
                    <div className="max-w-3xl rounded-2xl border border-[#E9E9EB]">

                    </div>
                </div>
            </div>
        </div>
    );
}
export default SettingsView