import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  MapPin, 
  Calendar, 
  Gift, 
  MessageSquare, 
  BarChart3,
  Images,
  LogOut,
  Home
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Wycieczki",
    url: "/admin/trips",
    icon: MapPin,
  },
  {
    title: "Galeria wspomnień",
    url: "/admin/gallery",
    icon: Images,
  },
  {
    title: "Rezerwacje",
    url: "/admin/reservations",
    icon: Calendar,
  },
  {
    title: "Vouchery",
    url: "/admin/vouchers",
    icon: Gift,
  },
  {
    title: "Wiadomości",
    url: "/admin/messages",
    icon: MessageSquare,
  },
  {
    title: "Raporty",
    url: "/admin/reports",
    icon: BarChart3,
  },
];

export function AdminSidebar() {
  const { signOut, isSigningOut } = useAuth();

  return (
    <Sidebar className="w-60">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Panel Administratora</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "hover:bg-sidebar-accent/50"
                    }
                  >
                    <Home className="mr-2 h-4 w-4" />
                    <span>Strona główna</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarSeparator className="my-2" />
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={signOut}
                  disabled={isSigningOut}
                  className={isSigningOut ? "opacity-50 cursor-not-allowed" : ""}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isSigningOut ? "Wylogowywanie..." : "Wyloguj"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}