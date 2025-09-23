import Header from "../Layout/Header";
import { MdSpaceDashboard } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";
import { FaRegCreditCard } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { listRooms, type Room } from "../../api/chat";

const adminNavLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: <MdSpaceDashboard />, useRouter: true },
];

export default function AdminHeader() {
  const [unreadTotal, setUnreadTotal] = useState<number>(0);
  useEffect(() => {
    const load = async () => {
      try {
        const rooms: Room[] = await listRooms();
        const total = rooms.reduce((sum, r: any) => sum + (r?.unread_count || 0), 0);
        setUnreadTotal(total);
      } catch {
        setUnreadTotal(0);
      }
    };
    load();
    const onRead = () => load();
    window.addEventListener("chat:read", onRead);
    return () => window.removeEventListener("chat:read", onRead);
  }, []);

  return <Header navLinks={adminNavLinks} unreadTotal={unreadTotal} />;
}
