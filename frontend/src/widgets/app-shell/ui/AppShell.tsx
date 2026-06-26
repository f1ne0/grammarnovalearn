import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import {
  BarChart3,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  GraduationCap,
  LayersIcon,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Moon,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Sun,
  UserRound,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSessionStore } from "../../../entities/session";
import { Toaster } from "../../../shared/ui";
import { CommandPalette } from "../../command-palette";

function UserMenu({ collapsed }: { collapsed?: boolean }) {
  const { user, logout } = useSessionStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const initials = (user.fullName ?? user.email).slice(0, 2).toUpperCase();

  return (
    <Box position="relative">
      <Flex
        as="button"
        align="center"
        gap="10px"
        w="full"
        p="6px"
        borderRadius="md"
        justify={collapsed ? "center" : "flex-start"}
        transition="background 160ms ease"
        _hover={{ bg: "surface2" }}
        onClick={() => setOpen(!open)}
        title={collapsed ? (user.fullName ?? user.email) : undefined}
      >
        <Flex
          w="30px"
          h="30px"
          borderRadius="full"
          bg="accentSubtle"
          align="center"
          justify="center"
          fontSize="12px"
          fontFamily="mono"
          color="accentHover"
          flexShrink={0}
        >
          {initials}
        </Flex>
        {!collapsed && (
          <>
            <Box flex="1" minW={0} textAlign="left">
              <Text fontSize="13px" color="text" lineClamp={1}>
                {user.fullName ?? user.email}
              </Text>
            </Box>
            <ChevronDown size={14} color="var(--chakra-colors-text-faint)" />
          </>
        )}
      </Flex>
      {open && (
        <>
          <Box
            position="fixed"
            inset={0}
            zIndex={19}
            onClick={() => setOpen(false)}
          />
          <Box
            position="absolute"
            bottom="calc(100% + 8px)"
            left={0}
            zIndex={20}
            minW="220px"
            bg="surface"
            border="1px solid"
            borderColor="border"
            borderRadius="md"
            boxShadow="0 8px 24px rgba(0,0,0,.4)"
            py="6px"
          >
            <Box px="12px" py="8px" borderBottom="1px solid" borderColor="border">
              <Text fontSize="13px" color="text" lineClamp={1}>
                {user.fullName ?? user.email}
              </Text>
              <Text fontSize="12px" color="textFaint" lineClamp={1}>
                {user.email}
              </Text>
            </Box>
            {user.role !== "TEACHER" && (
              <MenuRow
                icon={UserRound}
                label="My Progress"
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
              />
            )}
            <MenuRow
              icon={Settings}
              label="Account settings"
              onClick={() => {
                setOpen(false);
                navigate("/settings");
              }}
            />
            <Box borderTop="1px solid" borderColor="border" my="4px" />
            <MenuRow
              icon={LogOut}
              label="Log out"
              danger
              onClick={() => {
                logout();
                navigate("/login");
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

function MenuRow({
  icon: Icon,
  label,
  danger,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <Flex
      as="button"
      w="full"
      align="center"
      gap="10px"
      px="12px"
      py="8px"
      color={danger ? "error" : "textMuted"}
      transition="all 160ms ease"
      _hover={{ bg: "surface2", color: danger ? "error" : "text" }}
      onClick={onClick}
    >
      <Icon size={15} strokeWidth={1.5} />
      <Text fontSize="13px">{label}</Text>
    </Flex>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const toggle = () => {
    const next = !dark;
    const apply = () => {
      setDark(next);
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
    };
    // Native cross-fade of the whole page (no flicker); instant where unsupported.
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (doc.startViewTransition) doc.startViewTransition(apply);
    else apply();
  };
  return (
    <Flex
      as="button"
      align="center"
      justify="center"
      w="32px"
      h="32px"
      flexShrink={0}
      borderRadius="md"
      border="1px solid"
      borderColor="border"
      color="textMuted"
      transition="all 160ms ease"
      _hover={{ borderColor: "borderStrong", color: "text" }}
      onClick={toggle}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-label="Toggle theme"
    >
      {dark ? (
        <Sun size={15} strokeWidth={1.5} />
      ) : (
        <Moon size={15} strokeWidth={1.5} />
      )}
    </Flex>
  );
}

function TopBar({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <Flex
      h="52px"
      px="24px"
      align="center"
      justify="flex-end"
      gap="10px"
      borderBottom="1px solid"
      borderColor="border"
      bg="bg"
      position="sticky"
      top={0}
      zIndex={15}
      display={{ base: "none", md: "flex" }}
    >
      <Flex
        as="button"
        align="center"
        gap="8px"
        h="32px"
        px="12px"
        borderRadius="md"
        border="1px solid"
        borderColor="border"
        color="textFaint"
        transition="all 160ms ease"
        _hover={{ borderColor: "borderStrong", color: "textMuted" }}
        onClick={onOpenSearch}
      >
        <Search size={14} strokeWidth={1.5} />
        <Text fontSize="13px">Search</Text>
        <Text
          fontFamily="mono"
          fontSize="11px"
          border="1px solid"
          borderColor="border"
          borderRadius="4px"
          px="4px"
        >
          ⌘K
        </Text>
      </Flex>
      <ThemeToggle />
    </Flex>
  );
}

function SidebarItem({
  to,
  icon: Icon,
  label,
  collapsed,
  onClick,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/" || to === "/teacher"}
      title={collapsed ? label : undefined}
      onClick={onClick}
    >
      {({ isActive }) => (
        <Flex
          align="center"
          gap="10px"
          h="36px"
          px="10px"
          borderRadius="md"
          justify={collapsed ? "center" : "flex-start"}
          color={isActive ? "text" : "textMuted"}
          bg={isActive ? "surface2" : "transparent"}
          transition="all 160ms ease"
          _hover={{ bg: "surface2", color: "text" }}
        >
          <Icon size={18} strokeWidth={1.5} />
          {!collapsed && (
            <Text fontSize="14px" fontWeight={isActive ? "500" : "400"}>
              {label}
            </Text>
          )}
        </Flex>
      )}
    </NavLink>
  );
}

/** Role-based nav links, reused by the desktop sidebar and mobile drawer. */
function NavLinks({
  isTeacher,
  collapsed,
  onItemClick,
}: {
  isTeacher: boolean;
  collapsed?: boolean;
  onItemClick?: () => void;
}) {
  const p = { collapsed, onClick: onItemClick };
  return isTeacher ? (
    <>
      <SidebarItem to="/teacher" icon={Users} label="Students" {...p} />
      <SidebarItem to="/teacher/groups" icon={LayersIcon} label="Groups" {...p} />
      <SidebarItem to="/teacher/content" icon={Library} label="Content" {...p} />
      <SidebarItem to="/teacher/analytics" icon={BarChart3} label="Analytics" {...p} />
      <SidebarItem to="/teacher/generate" icon={Sparkles} label="Generate" {...p} />
      <SidebarItem to="/teacher/tests" icon={ClipboardList} label="Tests" {...p} />
    </>
  ) : (
    <>
      <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" {...p} />
      <SidebarItem to="/grammar" icon={GraduationCap} label="Grammar" {...p} />
      <SidebarItem to="/reviews" icon={RefreshCw} label="Reviews" {...p} />
      <SidebarItem to="/tests" icon={ClipboardList} label="Tests" {...p} />
    </>
  );
}

/** App shell: collapsible sidebar + topbar + content area. */
export function AppShell({ children }: { children: ReactNode }) {
  const user = useSessionStore((s) => s.user);
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "1",
  );

  const toggleSidebar = () =>
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebarCollapsed", next ? "1" : "0");
      return next;
    });

  const sidebarW = collapsed ? "68px" : "240px";

  // ⌘K / Ctrl+K opens the command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isTeacher = user?.role === "TEACHER";

  return (
    <Box minH="100vh" bg="bg">
      <Box
        as="aside"
        w={sidebarW}
        h="100vh"
        bg="sidebar"
        borderRight="1px solid"
        borderColor="border"
        p="12px"
        position="fixed"
        left={0}
        top={0}
        zIndex={30}
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        transition="width 160ms ease"
      >
        {/* Header: brand + collapse toggle */}
        <Flex
          align="center"
          justify={collapsed ? "center" : "space-between"}
          px={collapsed ? "0" : "10px"}
          py="14px"
          mb="8px"
        >
          {!collapsed && (
            <Flex align="center" gap="10px" minW={0}>
              <GraduationCap size={20} strokeWidth={1.5} color="#4F7CFF" />
              <Text fontSize="15px" fontWeight="600" color="text" lineClamp={1}>
                GrammarNovaLearn
              </Text>
            </Flex>
          )}
          <Flex
            as="button"
            align="center"
            justify="center"
            w="28px"
            h="28px"
            borderRadius="md"
            color="textFaint"
            transition="all 160ms ease"
            _hover={{ bg: "surface2", color: "text" }}
            onClick={toggleSidebar}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <ChevronsRight size={18} strokeWidth={1.5} />
            ) : (
              <ChevronsLeft size={18} strokeWidth={1.5} />
            )}
          </Flex>
        </Flex>

        <VStack align="stretch" gap="2px" flex="1">
          <NavLinks isTeacher={isTeacher} collapsed={collapsed} />
        </VStack>

        <Box borderTop="1px solid" borderColor="border" pt="8px">
          <UserMenu collapsed={collapsed} />
        </Box>
      </Box>

      {/* Mobile top bar */}
      <Flex
        display={{ base: "flex", md: "none" }}
        align="center"
        justify="space-between"
        px="16px"
        h="52px"
        bg="sidebar"
        borderBottom="1px solid"
        borderColor="border"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Flex align="center" gap="10px">
          <Flex
            as="button"
            align="center"
            justify="center"
            w="32px"
            h="32px"
            ml="-6px"
            borderRadius="md"
            color="textMuted"
            _hover={{ bg: "surface2", color: "text" }}
            onClick={() => setMobileNav(true)}
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={1.5} />
          </Flex>
          <GraduationCap size={18} strokeWidth={1.5} color="#4F7CFF" />
          <Text fontSize="14px" fontWeight="600" color="text">
            GrammarNovaLearn
          </Text>
        </Flex>
        <ThemeToggle />
      </Flex>

      {/* Mobile nav drawer */}
      {mobileNav && (
        <Box display={{ base: "block", md: "none" }}>
          <Box
            position="fixed"
            inset={0}
            zIndex={40}
            bg="rgba(0,0,0,.5)"
            onClick={() => setMobileNav(false)}
          />
          <Flex
            position="fixed"
            left={0}
            top={0}
            h="100vh"
            w="260px"
            maxW="80vw"
            zIndex={41}
            bg="sidebar"
            borderRight="1px solid"
            borderColor="border"
            p="12px"
            direction="column"
          >
            <Flex align="center" justify="space-between" px="10px" py="12px" mb="8px">
              <Flex align="center" gap="10px" minW={0}>
                <GraduationCap size={20} strokeWidth={1.5} color="#4F7CFF" />
                <Text fontSize="15px" fontWeight="600" color="text" lineClamp={1}>
                  GrammarNovaLearn
                </Text>
              </Flex>
              <Flex
                as="button"
                align="center"
                justify="center"
                w="28px"
                h="28px"
                borderRadius="md"
                color="textFaint"
                _hover={{ bg: "surface2", color: "text" }}
                onClick={() => setMobileNav(false)}
                aria-label="Close menu"
              >
                <X size={18} strokeWidth={1.5} />
              </Flex>
            </Flex>

            <VStack align="stretch" gap="2px" flex="1">
              <NavLinks
                isTeacher={isTeacher}
                onItemClick={() => setMobileNav(false)}
              />
            </VStack>

            <Box borderTop="1px solid" borderColor="border" pt="8px">
              <UserMenu />
            </Box>
          </Flex>
        </Box>
      )}

      <Box ml={{ base: 0, md: sidebarW }} transition="margin-left 160ms ease">
        <TopBar onOpenSearch={() => setSearchOpen(true)} />
        <Box key={pathname} className="page-in">
          {children}
        </Box>
      </Box>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toaster />
    </Box>
  );
}
