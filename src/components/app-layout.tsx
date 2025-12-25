'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  Building2,
  CalendarClock,
  ChevronRight,
  ClipboardCheck,
  FileCog,
  FileText,
  GitMerge,
  Home,
  Moon,
  Network,
  ScanLine,
  Server,
  Settings,
  Sun,
  Users,
  Wrench,
  LogOut,
  User,
  Building,
  Layers,
  DoorOpen,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
  },
  {
    title: 'Parc',
    icon: Network,
    items: [
      { href: '/parc/clients', label: 'Clients', icon: Users },
      { 
        label: 'Arborescence Technique', 
        icon: GitMerge,
        items: [
          { href: '/parc/arborescence/sites', label: 'Sites', icon: Home },
          { href: '/parc/arborescence/batiments', label: 'Bâtiments', icon: Building },
          { href: '/parc/arborescence/niveaux', label: 'Niveaux', icon: Layers },
          { href: '/parc/arborescence/locaux', label: 'Locaux', icon: DoorOpen },
          { href: '/parc/arborescence/equipements', label: 'Équipements', icon: Server },
        ]
      },
    ],
  },
  {
    title: 'Audits',
    icon: ClipboardCheck,
    items: [
      { href: '/audits/releves', label: 'Relevés / Audits', icon: ScanLine },
      { href: '/audits/livrables', label: 'Livrables', icon: FileText },
    ],
  },
  {
    title: 'Plan Pluriannuel de Travaux',
    icon: CalendarClock,
    href: '/ppa',
  },
  {
    title: 'Équipements',
    icon: Server,
    href: '/equipements',
  },
  {
    title: 'Préparation GMAO',
    icon: Wrench,
    items: [
      { href: '/gmao/equipements', label: 'Préparation Équipements', icon: Server },
      { href: '/gmao/livrables', label: 'Livrable GMAO', icon: FileCog },
    ],
  },
];

function useTheme() {
    const [theme, setTheme] = React.useState('light');

    React.useEffect(() => {
        const savedTheme = typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') ? 'dark' : 'light' : 'light';
        setTheme(savedTheme);
    }, []);

    const toggleTheme = (newTheme: 'light' | 'dark' | 'system') => {
        let themeToSet = newTheme;
        if (newTheme === 'system') {
            themeToSet = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        setTheme(themeToSet);
        document.documentElement.classList.toggle('dark', themeToSet === 'dark');
    };

    return { theme, toggleTheme };
}

// Mobile Sidebar Component
function MobileSidebar({ 
  isOpen, 
  onClose, 
  pathname, 
  navItems, 
  theme, 
  toggleTheme 
}: {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  navItems: any[];
  theme: string;
  toggleTheme: (theme: 'light' | 'dark' | 'system') => void;
}) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0 bg-gradient-to-b from-indigo-50 via-purple-50 to-blue-50 border-r border-purple-100">
        <div className="flex h-full flex-col">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-100">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo - diagia.jpg" 
                alt="Logo"
                className="size-6" 
                height={24}
                width={24}
              />
              <span className="font-semibold text-purple-600">DiagIA</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {navItems.map((group) => (
                <React.Fragment key={group.title}>
                  {group.items ? (
                    <Accordion type="multiple" className="w-full">
                      <AccordionItem value={group.title} className="border-none">
                        <AccordionTrigger className={cn(
                          "px-3 py-2.5 text-sm hover:no-underline rounded-xl font-medium transition-all",
                          "hover:bg-white/60 hover:shadow-sm text-gray-700"
                        )}>
                          <div className="flex items-center gap-3">
                            <group.icon className="size-5" />
                            <span>{group.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-2">
                          <div className="space-y-0.5 pl-4">
                            {group.items.map((item) => (
                              item.items ? (
                                <Accordion key={item.label} type="single" collapsible className="w-full">
                                  <AccordionItem value={item.label} className="border-none">
                                    <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline hover:bg-white/60 rounded-xl text-gray-600">
                                      <div className="flex items-center gap-2">
                                        {item.icon && <item.icon className="size-4" />}
                                        <span>{item.label}</span>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-1 pb-1">
                                      <div className="space-y-0.5">
                                        {item.items.map(subItem => (
                                          <Link
                                            key={subItem.href}
                                            href={subItem.href}
                                            className={cn(
                                              "flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-all",
                                              pathname === subItem.href
                                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                                                : "text-gray-600 hover:bg-white/60"
                                            )}
                                            onClick={onClose}
                                          >
                                            {subItem.icon && <subItem.icon className="size-4" />}
                                            <span>{subItem.label}</span>
                                          </Link>
                                        ))}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              ) : (
                                <Link
                                  key={item.href}
                                  href={item.href!}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-all",
                                    pathname.startsWith(item.href!)
                                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                                      : "text-gray-600 hover:bg-white/60"
                                  )}
                                  onClick={onClose}
                                >
                                  {item.icon && <item.icon className="size-4" />}
                                  <span>{item.label}</span>
                                </Link>
                              )
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <Link
                      href={group.href!}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                        pathname === group.href
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-white/60 hover:shadow-sm"
                      )}
                      onClick={onClose}
                    >
                      <group.icon className="size-5" />
                      <span>{group.title}</span>
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="border-t border-purple-100 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 px-2 text-gray-700 hover:bg-white/60 rounded-xl">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://picsum.photos/100" alt="Admin" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium">Admin</p>
                    <p className="text-xs text-gray-500">admin@diagia.ai</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" side="top" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {theme === 'light' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => toggleTheme('light')}>Light</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleTheme('dark')}>Dark</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleTheme('system')}>System</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Desktop Sidebar Component
function DesktopSidebar({ 
  pathname, 
  navItems 
}: {
  pathname: string;
  navItems: any[];
}) {
  return (
    <div className="fixed left-0 top-0 z-40 h-screen w-48 bg-gradient-to-b from-indigo-50 via-purple-50 to-blue-50 border-r border-purple-100">
      <div className="flex h-full flex-col">
        {/* Logo - kept in sidebar per image */}
        <div className="p-4 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
            <span className="font-bold text-purple-600">DiagIA</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {navItems.map((group) => (
              <React.Fragment key={group.title}>
                {group.items ? (
                  <Accordion type="multiple" defaultValue={['Parc']} className="w-full">
                    <AccordionItem value={group.title} className="border-none">
                      <AccordionTrigger className={cn(
                        "px-3 py-2.5 text-sm hover:no-underline rounded-xl font-medium transition-all",
                        "hover:bg-white/60 hover:shadow-sm text-gray-700"
                      )}>
                        <div className="flex items-center gap-3">
                          <group.icon className="size-5 flex-shrink-0" />
                          <span className="text-left text-xs">{group.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-2">
                        <div className="space-y-0.5 pl-4">
                          {group.items.map((item) => (
                            item.items ? (
                              <Accordion key={item.label} type="single" collapsible className="w-full">
                                <AccordionItem value={item.label} className="border-none">
                                  <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline hover:bg-white/60 rounded-xl text-gray-600">
                                    <div className="flex items-center gap-2">
                                      {item.icon && <item.icon className="size-4" />}
                                      <span className="text-left">{item.label}</span>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="pt-1 pb-1">
                                    <div className="space-y-0.5">
                                      {item.items.map(subItem => (
                                        <Link
                                          key={subItem.href}
                                          href={subItem.href}
                                          className={cn(
                                            "flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-all",
                                            pathname === subItem.href
                                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                                              : "text-gray-600 hover:bg-white/60"
                                          )}
                                        >
                                          {subItem.icon && <subItem.icon className="size-4" />}
                                          <span>{subItem.label}</span>
                                        </Link>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            ) : (
                              <Link
                                key={item.href}
                                href={item.href!}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-all",
                                  pathname.startsWith(item.href!)
                                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-white/60"
                                )}
                              >
                                {item.icon && <item.icon className="size-4" />}
                                <span>{item.label}</span>
                              </Link>
                            )
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <Link
                    href={group.href!}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      pathname === group.href
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-white/60 hover:shadow-sm"
                    )}
                  >
                    <group.icon className="size-5 flex-shrink-0" />
                    <span className="text-xs">{group.title}</span>
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const breadcrumbs = React.useMemo(() => {
    const pathParts = pathname.split('/').filter(part => part);
    const filteredPathParts = pathParts.filter(part => part !== 'arborescence');
    
    const crumbs = filteredPathParts.map((part, index) => {
        const href = '/' + pathParts.slice(0, pathParts.indexOf(part) + 1).join('/');
        let label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');

        const findLabel = (items: any[]): string | undefined => {
            for (const item of items) {
                if (item.href && item.href.endsWith(part)) return item.label;
                if (item.items) {
                    const subLabel = findLabel(item.items);
                    if (subLabel) return subLabel;
                }
            }
            return undefined;
        }
        
        if (part.match(/^(site|bat|niv|loc|eq)-/)) {
            const parentPath = pathParts[pathParts.indexOf(part) - 1];
            if (parentPath === 'arborescence') label = 'Sites';
            else {
                label = parentPath.charAt(0).toUpperCase() + parentPath.slice(1);
            }
        } else {
           const foundLabel = findLabel(navItems);
           if(foundLabel) label = foundLabel;
        }

        return { href, label };
    });

    const homeCrumb = { href: '/dashboard', label: 'Home' };

    if (pathname.includes('/parc/arborescence')) {
        const arboCrumb = { href: '/parc/arborescence', label: 'Arborescence' };
        return [homeCrumb, arboCrumb, ...crumbs.slice(2)];
    }

    return [homeCrumb, ...crumbs];
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-gradient-to-r from-purple-100/80 via-blue-100/80 to-pink-100/80 backdrop-blur-md border-b border-purple-200/50">
        <div className="flex h-full items-center justify-between px-4">
          {/* Left Section - Mobile Menu & Breadcrumbs */}
          <div className="flex items-center gap-3 flex-1">
            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 p-0">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <MobileSidebar 
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                pathname={pathname}
                navItems={navItems}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            </Sheet>

            {/* Breadcrumbs */}
            <div className="flex-1">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbItem>
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage className="text-purple-900 font-medium text-sm">{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.href} className="text-purple-600 hover:text-purple-800 text-sm">
                              {crumb.label}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {/* Right Section - User Menu */}
          <div className="flex items-center gap-2">
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-8 hover:bg-white/60 rounded-xl">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="https://picsum.photos/100" alt="Admin" />
                    <AvatarFallback className="text-xs">AD</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-xs font-medium text-gray-700">Admin</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" side="bottom" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {theme === 'light' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => toggleTheme('light')}>Light</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleTheme('dark')}>Dark</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleTheme('system')}>System</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DesktopSidebar 
          pathname={pathname}
          navItems={navItems}
        />
      </div>

      {/* Main Content */}
      <main className="pt-12 md:ml-48">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}