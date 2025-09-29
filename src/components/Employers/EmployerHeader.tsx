import Header from "../Layout/Header";  
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { listRooms, type Room } from "../../api/chat";
import { MdSpaceDashboard } from "react-icons/md";
// import { LuBot } from "react-icons/lu";
import { FaRegUser } from "react-icons/fa";
import { FaRegMessage } from "react-icons/fa6";

const employerNavLinks = [
  { name: "Dashboard", href: "/employer/dashboard", icon: <MdSpaceDashboard />, useRouter: true },
  // { name: "AI Assistant", href: "/employer/assistant", icon: <LuBot />, useRouter: true },
  { name: "Profile", href: "/employer/profile", icon: <FaRegUser />, useRouter: true },
  { name: "Messages", href: "/employer/messages", icon: <FaRegMessage />, useRouter: true },
  // { name: "Subscription", href: "/employer/subscription", icon: <MdOutlineSubscriptions />, useRouter: true },
];

function EmployerHeader() {
  const [unreadTotal, setUnreadTotal] = useState<number>(0);
  const location = useLocation();

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
    const onRead = () => { load(); };
    window.addEventListener('chat:read', onRead);
    return () => window.removeEventListener('chat:read', onRead);
  }, []);

  useEffect(() => {
    const refresh = async () => {
      try {
        const rooms: Room[] = await listRooms();
        const total = rooms.reduce((sum, r: any) => sum + (r?.unread_count || 0), 0);
        setUnreadTotal(total);
      } catch {}
    };
    refresh();
  }, [location.pathname]);

  return <Header navLinks={employerNavLinks} unreadTotal={unreadTotal} />;
}

export default EmployerHeader;
