import { redirect } from "next/navigation";
import { settingsNav } from "@/lib/settings/datas";

const SettingsPage = () => {
    redirect(settingsNav[0].href);
}
export default SettingsPage