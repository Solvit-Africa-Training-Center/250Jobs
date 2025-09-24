import Header from "../Layout/Header";
import { useEffect, useState } from "react";
import { listRooms, type Room } from "../../api/chat";

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

 
  return <Header navLinks={[]} unreadTotal={unreadTotal} />;
}
