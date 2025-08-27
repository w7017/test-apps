
'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  ShieldCheck,
  Ticket,
  CalendarCheck,
  Timer,
  TrendingUp,
  Filter,
  Calendar as CalendarIcon,
  Copy,
  FileWarning,
  ClipboardX,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const kpiData = [
  { title: 'Taux Conformité', value: '98.2%', change: '+1.5%', icon: ShieldCheck, color: 'text-green-500' },
  { title: 'Tickets Ouverts', value: '32', change: '+5', icon: Ticket, color: 'text-red-500' },
  { title: 'OT Préventives Dues', value: '14', change: '-2', icon: CalendarCheck, color: 'text-yellow-500' },
  { title: 'MTTR / MTBF (h)', value: '4.2 / 210', change: '+0.2', icon: Timer, color: 'text-blue-500' },
  { title: 'Économies Estimées', value: '€ 12,450', change: '+€800', icon: TrendingUp, color: 'text-green-500' },
];

const dataQualityKpis = [
    { title: 'Équipements en Doublon', value: '12', change: '-2 cette semaine', icon: Copy, color: 'text-yellow-500' },
    { title: 'Champs Requis Manquants', value: '87', change: '+15 cette semaine', icon: FileWarning, color: 'text-orange-500' },
    { title: 'Audits Incomplets', value: '5', change: '+1 cette semaine', icon: ClipboardX, color: 'text-red-500' },
]

const criticalAssets = [
  { tag: 'CVC-001', category: 'HVAC', location: 'Bât. A - Toit', status: 'Alerte' },
  { tag: 'ELEC-003', category: 'Éclairage', location: 'Bât. B - Étage 2', status: 'OK' },
  { tag: 'SEC-002', category: 'Sécurité', location: 'Parking', status: 'Hors service' },
  { tag: 'PROD-015', category: 'Production', location: 'Atelier', status: 'OK' },
  { tag: 'ASC-001', category: 'Ascenseur', location: 'Bât. A - Central', status: 'Alerte' },
];

const urgentTickets = [
    { id: '#8321', asset: 'CVC-001', priority: 'P1 - Urgente', assignee: 'Équipe CVC', status: 'En cours' },
    { id: '#8320', asset: 'ASC-001', priority: 'P1 - Urgente', assignee: 'Tech 3', status: 'À faire' },
    { id: '#8319', asset: 'PROD-007', priority: 'P2 - Haute', assignee: 'Équipe PROD', status: 'En attente' },
    { id: '#8318', asset: 'SEC-002', priority: 'P1 - Urgente', assignee: 'Équipe SEC', status: 'À faire' },
];

const slaData = [
    { name: 'P1', achieved: 92, missed: 8 },
    { name: 'P2', achieved: 95, missed: 5 },
    { name: 'P3', achieved: 98, missed: 2 },
    { name: 'P4', achieved: 100, missed: 0 },
];

function StatusBadge({ status }: { status: string }) {
    const variant = {
        'Alerte': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        'OK': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Hors service': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        'En cours': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        'À faire': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        'En attente': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    }[status] || 'default';
    return <Badge className={`border-transparent ${variant}`}>{status}</Badge>;
}

export default function DashboardPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-bold tracking-tight font-headline">
          Dashboard
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-2">
            <Select defaultValue="all-sites">
                <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Site" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all-sites">Tous les sites</SelectItem>
                    <SelectItem value="site-a">Site A</SelectItem>
                    <SelectItem value="site-b">Site B</SelectItem>
                </SelectContent>
            </Select>
            <Popover>
                <PopoverTrigger asChild>
                <Button variant={"outline"} className="w-full sm:w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? date.toLocaleDateString() : <span>Pick a date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Performance Opérationnelle</CardTitle>
            <CardDescription>Vue d'ensemble des indicateurs de performance clés (KPIs).</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {kpiData.map((kpi) => (
                <Card key={kpi.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                    <kpi.icon className={`h-4 w-4 text-muted-foreground ${kpi.color}`} />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <p className="text-xs text-muted-foreground">{kpi.change} vs. last month</p>
                    </CardContent>
                </Card>
                ))}
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Qualité des Données</CardTitle>
            <CardDescription>Indicateurs sur la qualité et la complétude des données de la GMAO.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dataQualityKpis.map((kpi) => (
                <Card key={kpi.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                    <kpi.icon className={`h-4 w-4 text-muted-foreground ${kpi.color}`} />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <p className="text-xs text-muted-foreground">{kpi.change}</p>
                    </CardContent>
                </Card>
                ))}
            </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Respect des SLA</CardTitle>
            <CardDescription>Performance par niveau de priorité ce mois-ci.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ResponsiveContainer width="100%" height={350}>
                <BarChart data={slaData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                    <Bar dataKey="achieved" name="Atteint" fill="hsl(var(--primary))" stackId="a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="missed" name="Manqué" fill="hsl(var(--destructive) / 0.5)" stackId="a" radius={[4, 4, 0, 0]}/>
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Tickets Urgents</CardTitle>
            <CardDescription>Les tickets P1 et P2 nécessitant une attention immédiate.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Statut</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {urgentTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>{ticket.asset}</TableCell>
                        <TableCell>
                            <Badge variant={ticket.priority.startsWith("P1") ? 'destructive' : 'secondary'}>
                                {ticket.priority}
                            </Badge>
                        </TableCell>
                        <TableCell><StatusBadge status={ticket.status} /></TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Équipements Critiques</CardTitle>
            <CardDescription>Vue d'ensemble des équipements les plus importants.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tag</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Localisation</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {criticalAssets.map((asset) => (
                    <TableRow key={asset.tag}>
                        <TableCell className="font-medium">{asset.tag}</TableCell>
                        <TableCell>{asset.category}</TableCell>
                        <TableCell>{asset.location}</TableCell>
                        <TableCell><StatusBadge status={asset.status}/></TableCell>
                        <TableCell className="text-right">
                        <Button variant="outline" size="sm">Détails</Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
