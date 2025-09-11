
'use client';

import React, { useMemo, useState, useCallback, useRef, MouseEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { differenceInDays, format, parse, startOfDay, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Task } from './ppa-tasks';

const DATE_FORMAT = 'yyyy-MM-dd';
const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy';

const GanttChartHeader = ({ timeRange, totalDays }) => {
  const months = [];
  if (!timeRange.start || !timeRange.end || totalDays <= 0) return null;

  let currentMonth = startOfDay(timeRange.start);

  while (currentMonth <= timeRange.end) {
    const monthStart = currentMonth;
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const visibleMonthEnd = monthEnd > timeRange.end ? timeRange.end : monthEnd;
    const daysInMonth = differenceInDays(visibleMonthEnd, monthStart) + 1;
    
    months.push({
      name: format(monthStart, 'MMMM yyyy', { locale: fr }),
      width: (daysInMonth / totalDays) * 100,
    });
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  }

  return (
    <div className="flex text-center text-sm font-semibold text-muted-foreground h-12 items-center border-b sticky top-0 bg-card z-20">
      {months.map((month, index) => (
        <div key={index} style={{ width: `${month.width}%` }} className="capitalize truncate px-2">
          {month.name}
        </div>
      ))}
    </div>
  );
};

const GanttChartTimeline = ({ tasks, timeRange, totalDays, onTaskUpdate }) => {
  const today = startOfDay(new Date());
  const todayOffset = timeRange.start ? differenceInDays(today, timeRange.start) : -1;
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const [interactingTask, setInteractingTask] = useState<{task: Task, type: 'drag' | 'resize', handle?: 'left' | 'right'} | null>(null);
  const [initialDragX, setInitialDragX] = useState(0);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>, task, type: 'drag' | 'resize', handle?: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setInteractingTask({ task, type, handle });
    setInitialDragX(e.clientX);
  };

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!interactingTask || !timelineRef.current) return;

    const timelineWidth = timelineRef.current.offsetWidth;
    const pixelPerDay = timelineWidth / totalDays;
    const deltaX = e.clientX - initialDragX;
    const dayOffset = Math.round(deltaX / pixelPerDay);
    
    if (dayOffset === 0) return;

    let tempTasks = tasks.map(t => {
      if (t.id === interactingTask.task.id) {
        let newStartDate = parse(t.startDate, DATE_FORMAT, new Date());
        let newEndDate = parse(t.endDate, DATE_FORMAT, new Date());

        if (interactingTask.type === 'drag') {
          newStartDate = addDays(newStartDate, dayOffset);
          newEndDate = addDays(newEndDate, dayOffset);
        } else if (interactingTask.type === 'resize') {
          if (interactingTask.handle === 'left') {
            newStartDate = addDays(newStartDate, dayOffset);
            if (newStartDate > newEndDate) newStartDate = newEndDate;
          } else { // right handle
            newEndDate = addDays(newEndDate, dayOffset);
            if (newEndDate < newStartDate) newEndDate = newStartDate;
          }
        }
        
        return {
            ...t,
            tempStartDate: format(newStartDate, DATE_FORMAT),
            tempEndDate: format(newEndDate, DATE_FORMAT),
        }
      }
      return t;
    });

    onTaskUpdate(tempTasks, false);

  }, [interactingTask, initialDragX, tasks, totalDays, onTaskUpdate]);

  const handleMouseUp = useCallback(() => {
    if(!interactingTask) return;

    const taskToUpdate = tasks.find(t => t.id === interactingTask.task.id);
    if(taskToUpdate && (taskToUpdate.tempStartDate || taskToUpdate.tempEndDate)) {
        const finalTasks = tasks.map(t => {
            if (t.id === interactingTask.task.id) {
                const { tempStartDate, tempEndDate, ...rest } = t;
                return {
                    ...rest,
                    startDate: tempStartDate || t.startDate,
                    endDate: tempEndDate || t.endDate,
                };
            }
            return t;
        });
        onTaskUpdate(finalTasks, true);
    }
    setInteractingTask(null);
  }, [interactingTask, tasks, onTaskUpdate]);

  useEffect(() => {
    if (interactingTask) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [interactingTask, handleMouseMove, handleMouseUp]);


  return (
    <div className="relative h-full" ref={timelineRef}>
      <div className="absolute inset-0 grid" style={{gridTemplateColumns: `repeat(${totalDays}, minmax(0, 1fr))`}}>
        {[...Array(totalDays)].map((_, i) => <div key={i} className="border-r"></div>)}
      </div>
      
      {todayOffset >= 0 && todayOffset < totalDays && (
         <div 
            className="absolute top-0 bottom-0 border-l-2 border-destructive z-10"
            style={{ left: `${(todayOffset / totalDays) * 100}%` }}
            title="Aujourd'hui"
        />
      )}
      <div className="relative h-full pt-1">
        <div className="space-y-1 text-sm relative">
          {tasks.map(task => {
            const taskStart = parse(task.tempStartDate || task.startDate, DATE_FORMAT, new Date());
            const taskEnd = parse(task.tempEndDate || task.endDate, DATE_FORMAT, new Date());
            
            if (!timeRange.start || isNaN(taskStart.getTime()) || isNaN(taskEnd.getTime())) return null;

            const startOffset = differenceInDays(taskStart, timeRange.start);
            const duration = differenceInDays(taskEnd, taskStart) + 1;

            if (startOffset < -totalDays || startOffset > totalDays) return null;

            const width = (duration / totalDays) * 100;
            const marginLeft = (startOffset / totalDays) * 100;
            
            const isInteracting = interactingTask?.task.id === task.id;

            return (
              <div key={task.id} className="h-8 flex items-center text-white text-xs">
                <div 
                  onMouseDown={(e) => handleMouseDown(e, task, 'drag')}
                  className={cn(
                      "h-6 rounded px-2 flex items-center overflow-hidden cursor-move transition-shadow relative group", 
                      task.color,
                      isInteracting && "shadow-lg ring-2 ring-primary z-20"
                  )} 
                  style={{ width: `${width}%`, marginLeft: `${marginLeft}%` }}
                  title={`${task.title} (${format(taskStart, DISPLAY_DATE_FORMAT)} - ${format(taskEnd, DISPLAY_DATE_FORMAT)})`}>
                    <div 
                      onMouseDown={(e) => handleMouseDown(e, task, 'resize', 'left')} 
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/20"
                    />
                    <span className="truncate pointer-events-none px-1">{task.assignee}</span>
                    <div 
                      onMouseDown={(e) => handleMouseDown(e, task, 'resize', 'right')} 
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/20"
                    />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export function PpaGantt({ tasks, setTasks: setParentTasks }) {
  const [internalTasks, setInternalTasks] = useState(tasks);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const taskListContainerRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);

  useEffect(() => {
    setInternalTasks(tasks);
  }, [tasks]);

  const timeRange = useMemo(() => {
    const tasksToUse = internalTasks || [];
    if (tasksToUse.length === 0) {
        const today = new Date();
        return { start: startOfDay(today), end: addDays(startOfDay(today), 30) };
    }
    const dates = tasksToUse.flatMap(t => {
      const start = t.tempStartDate ? parse(t.tempStartDate, DATE_FORMAT, new Date()) : parse(t.startDate, DATE_FORMAT, new Date());
      const end = t.tempEndDate ? parse(t.tempEndDate, DATE_FORMAT, new Date()) : parse(t.endDate, DATE_FORMAT, new Date());
      return [start, end];
    });
    
    const validDates = dates.filter(d => d && !isNaN(d.getTime()));
    if(validDates.length === 0) {
        const today = new Date();
        return { start: startOfDay(today), end: addDays(startOfDay(today), 30) };
    }
    
    const minDate = new Date(Math.min.apply(null, validDates as any));
    const maxDate = new Date(Math.max.apply(null, validDates as any));

    return { start: minDate, end: maxDate };
  }, [internalTasks]);


  const totalDays = useMemo(() => {
      if (!timeRange.start || !timeRange.end || isNaN(timeRange.start.getTime()) || isNaN(timeRange.end.getTime())) return 1;
      return differenceInDays(timeRange.end, timeRange.start) + 1;
  }, [timeRange]);

  const handleTaskUpdate = (updatedTasks, isFinal) => {
    setInternalTasks(updatedTasks);
    if(isFinal) {
        setParentTasks(updatedTasks.map(t => {
            const { tempStartDate, tempEndDate, ...rest } = t;
            return rest;
        }));
    }
  }

  const handleScroll = (source: 'tasklist' | 'timeline') => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    
    const sourceEl = source === 'tasklist' ? taskListContainerRef.current : timelineContainerRef.current;
    const targetEl = source === 'tasklist' ? timelineContainerRef.current : taskListContainerRef.current;

    if (sourceEl && targetEl) {
        targetEl.scrollTop = sourceEl.scrollTop;
    }
    
    setTimeout(() => { isSyncing.current = false; }, 50);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagramme de Gantt</CardTitle>
        <CardDescription>Vue d'ensemble de la planification des tâches.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-0 p-4 sm:p-6 border-b">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-sm sm:text-base text-muted-foreground font-medium">Période :</span>
              {timeRange.start && timeRange.end && !isNaN(timeRange.start.getTime()) ? (
                <div className="flex items-center bg-muted border rounded-md px-3 py-1.5 text-sm">
                    <span>{format(timeRange.start, DISPLAY_DATE_FORMAT, { locale: fr })}</span>
                    <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                    <span>{format(timeRange.end, DISPLAY_DATE_FORMAT, { locale: fr })}</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Aucune tâche à afficher</div>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
            
            <div className="lg:col-span-4 border-r">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-muted-foreground h-12 items-center px-2 border-b sticky top-0 bg-card z-20">
                    <div className="col-span-3">Début</div>
                    <div className="col-span-3">Fin</div>
                    <div className="col-span-6">Titre</div>
                </div>
                <div 
                    ref={taskListContainerRef}
                    onScroll={() => handleScroll('tasklist')}
                    className="space-y-1 text-sm overflow-y-auto" 
                    style={{ maxHeight: '60vh' }}
                >
                    {internalTasks.map(task => (
                    <div key={task.id} className="grid grid-cols-12 gap-4 items-center p-2 h-8 rounded-md hover:bg-muted/50">
                        <div className="col-span-3">{format(parse(task.startDate, DATE_FORMAT, new Date()), DISPLAY_DATE_FORMAT, { locale: fr })}</div>
                        <div className="col-span-3">{format(parse(task.endDate, DATE_FORMAT, new Date()), DISPLAY_DATE_FORMAT, { locale: fr })}</div>
                        <div className="col-span-6 truncate">{task.title}</div>
                    </div>
                    ))}
                    {internalTasks.length === 0 && (
                        <div className="text-center col-span-12 py-4 text-muted-foreground">Pas de tâches</div>
                    )}
                </div>
            </div>
            
            <div className="lg:col-span-8 relative">
                <div 
                    ref={timelineContainerRef}
                    onScroll={() => handleScroll('timeline')}
                    className="overflow-y-auto overflow-x-auto"
                    style={{ maxHeight: '60vh' }}
                >
                    <div className="relative" style={{minWidth: '1600px'}}>
                        <GanttChartHeader timeRange={timeRange} totalDays={totalDays}/>
                        {internalTasks.length > 0 && totalDays > 0 ? (
                        <GanttChartTimeline tasks={internalTasks} timeRange={timeRange} totalDays={totalDays} onTaskUpdate={handleTaskUpdate}/>
                        ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            Chronologie vide
                        </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

    