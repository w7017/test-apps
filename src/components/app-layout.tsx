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
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
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
} from 'lucide-react';
import { ClientContext, type Client } from '@/contexts/client-context';

const navItems = [
  {
    title: 'Parc',
    icon: Network,
    items: [
      { href: '/parc/clients', label: 'Clients', icon: Users },
      { 
        label: 'Arborescence Technique', 
        icon: GitMerge,
        items: [
          { href: '/parc/arborescence/sites', label: 'Liste des Sites', icon: Building2 },
          { href: '/parc/arborescence/batiments', label: 'Liste des Bâtiments', icon: Building2 },
          { href: '/parc/arborescence/niveaux', label: 'Liste des Niveaux', icon: Building2 },
          { href: '/parc/arborescence/locaux', label: 'Liste des Locaux', icon: Building2 },
          { href: '/parc/arborescence/equipements', label: 'Liste des Équipements', icon: Server },
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
    label: 'Plan Pluriannuel de Travaux',
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
        const localTheme = localStorage.getItem('theme');
        if (localTheme) {
            setTheme(localTheme);
            document.documentElement.classList.toggle('dark', localTheme === 'dark');
        }
    }, []);

    const toggleTheme = (newTheme: 'light' | 'dark' | 'system') => {
        let themeToSet = newTheme;
        if (newTheme === 'system') {
            themeToSet = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        setTheme(themeToSet);
        localStorage.setItem('theme', themeToSet);
        document.documentElement.classList.toggle('dark', themeToSet === 'dark');
    };

    return { theme, toggleTheme };
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { selectedClient, setSelectedClient, clients } = React.useContext(ClientContext);

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
    }
  };


  const breadcrumbs = React.useMemo(() => {
    const pathParts = pathname.split('/').filter(part => part);
    // Filter out 'arborescence' from breadcrumbs
    const filteredPathParts = pathParts.filter(part => part !== 'arborescence');
    
    const crumbs = filteredPathParts.map((part, index) => {
        const href = '/' + pathParts.slice(0, pathParts.indexOf(part) + 1).join('/');
        let label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');

        // Try to find a more friendly name from navItems
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
        
        // This is a hacky way to replace id-like parts with a more generic name
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

    // If we are in arborescence, add the base link
    if (pathname.includes('/parc/arborescence')) {
        const arboCrumb = { href: '/parc/arborescence', label: 'Arborescence' };
        return [homeCrumb, arboCrumb, ...crumbs.slice(2)];
    }

    return [homeCrumb, ...crumbs];
}, [pathname]);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset" className="bg-gradient-to-t from-blue-900 via-blue-700 to-blue-600 [&_[data-sidebar=sidebar]]:bg-transparent [&_[data-sidebar=header]]:border-white/20 [&_[data-sidebar=footer]]:border-white/20">
        <SidebarHeader className="border-b border-white/20">
            <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
                <Image
                    src="/logo - diagia.jpg" 
                    alt="Logo"
                    className="size-6 text-primary group-data-[collapsible=icon]:size-8" 
                    height={24}
                    width={24}
                    data-ai-hint="company logo"
                />
            </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <div className="p-2">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/dashboard'} className="text-white hover:bg-white/10 data-[active=true]:bg-white/20">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Home className="size-4" />
                            <span>Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </div>
          
          <SidebarSeparator className="mx-2 bg-white/20" />
          
          <Accordion type="multiple" defaultValue={['Parc', 'Audits', 'Préparation GMAO']} className="w-full">
            {navItems.map((group, groupIndex) => (
                <React.Fragment key={group.title}>
                    {group.items ? (
                        <AccordionItem value={group.title} className="border-none">
                            <AccordionTrigger className="mx-2 px-2 py-2 text-sm hover:no-underline hover:bg-white/10 rounded-md text-white font-medium [&[data-state=open]>svg]:text-white">
                                <div className="flex items-center gap-2">
                                    <group.icon className="size-4 shrink-0" />
                                    <span className="group-data-[collapsible=icon]:hidden">{group.title}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-1 pb-2">
                                <SidebarMenu>
                                {group.items.map((item) => (
                                    item.items ? (
                                        <Accordion key={item.label} type="single" collapsible className="w-full">
                                            <AccordionItem value={item.label} className="border-none">
                                                 <AccordionTrigger className="mx-2 px-2 py-1.5 text-sm hover:no-underline hover:bg-white/10 rounded-md text-white/90 [&[data-state=open]>svg]:text-white">
                                                    <div className="flex items-center gap-2 pl-6">
                                                        {item.icon && <item.icon className="size-4 shrink-0" />}
                                                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                                                    </div>
                                                 </AccordionTrigger>
                                                 <AccordionContent className="pt-1 pb-1">
                                                    <SidebarMenu>
                                                    {item.items.map(subItem => (
                                                        <SidebarMenuItem key={subItem.href}>
                                                            <SidebarMenuButton asChild isActive={pathname === subItem.href} size="sm" className="mx-2 justify-start text-white hover:bg-white/10 data-[active=true]:bg-white/20">
                                                                <Link href={subItem.href} className="flex items-center gap-2 pl-14">
                                                                    <span className="group-data-[collapsible=icon]:hidden">{subItem.label}</span>
                                                                </Link>
                                                            </SidebarMenuButton>
                                                        </SidebarMenuItem>
                                                    ))}
                                                    </SidebarMenu>
                                                 </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    ) : (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton asChild isActive={pathname.startsWith(item.href!)} size="sm" className="mx-2 justify-start text-white hover:bg-white/10 data-[active=true]:bg-white/20">
                                                <Link href={item.href!} className="flex items-center gap-2 pl-6">
                                                    {item.icon && <item.icon className="size-4 shrink-0" />}
                                                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                ))}
                                </SidebarMenu>
                            </AccordionContent>
                        </AccordionItem>
                    ) : (
                        <div className="p-2">
                             <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={pathname === group.href} className="text-white hover:bg-white/10 data-[active=true]:bg-white/20">
                                        <Link href={group.href!} className="flex items-center gap-2">
                                            <group.icon className="size-4 shrink-0" />
                                            <span className="group-data-[collapsible=icon]:hidden">{group.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </div>
                    )}
                    
                    {/* Add separator between major sections, but not after the last one */}
                    {groupIndex < navItems.length - 1 && (
                        <SidebarSeparator className="mx-2 my-1 bg-white/20" />
                    )}
                </React.Fragment>
            ))}
          </Accordion>
        </SidebarContent>
        <SidebarFooter className="border-t border-white/20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 px-2 text-white hover:bg-white/10">
                    <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src="https://picsum.photos/100" alt="Admin" data-ai-hint="person face"/>
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="text-left group-data-[collapsible=icon]:hidden">
                        <p className="text-sm font-medium">Admin</p>
                        <p className="text-xs text-white/70">admin@diagia.ai</p>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
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
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 bg-blue-600 text-white">
          <SidebarTrigger />
          <div className="flex-1">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="hidden md:block">
             <Select value={selectedClient?.id} onValueChange={handleClientChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}