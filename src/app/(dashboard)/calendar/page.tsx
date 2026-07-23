"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Trash2,
  User,
} from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const EVENT_TYPE_COLORS = {
  meeting: "bg-blue-500",
  call: "bg-green-500",
  task: "bg-yellow-500",
  other: "bg-gray-500",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "meeting" as "meeting" | "call" | "task" | "other",
    startTime: "",
    endTime: "",
    allDay: false,
    location: "",
    contactId: "" as string,
    createTask: true,
  });

  const events = useQuery(api.events.listByUser);
  const contacts = useQuery(api.contacts.listByUser);
  const companies = useQuery(api.companies.listByUser);
  const createEvent = useMutation(api.events.create);
  const deleteEvent = useMutation(api.events.remove);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [firstDayOfMonth, daysInMonth]);

  const getEventsForDate = (day: number) => {
    if (!events) return [];
    const date = new Date(year, month, day);
    const startOfDay = date.getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

    return events.filter(
      (event) => event.startDate >= startOfDay && event.startDate < endOfDay
    );
  };

  const getContactName = (contactId?: string) => {
    if (!contactId || !contacts) return null;
    const contact = contacts.find((c) => c._id === contactId);
    return contact?.name || null;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  const openNewEventDialog = () => {
    if (selectedDate) {
      const startTime = new Date(selectedDate);
      startTime.setHours(9, 0, 0, 0);
      const endTime = new Date(selectedDate);
      endTime.setHours(10, 0, 0, 0);

      setFormData({
        title: "",
        description: "",
        type: "meeting",
        startTime: startTime.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16),
        allDay: false,
        location: "",
        contactId: "",
        createTask: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    try {
      const startDate = new Date(formData.startTime).getTime();
      const endDate = new Date(formData.endTime).getTime();

      await createEvent({
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        startDate,
        endDate,
        allDay: formData.allDay,
        location: formData.location || undefined,
        contactId: (formData.contactId as Id<"contacts">) || undefined,
        createTask: formData.createTask,
      });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        type: "meeting",
        startTime: "",
        endTime: "",
        allDay: false,
        location: "",
        contactId: "",
        createTask: true,
      });
    } catch (error) {
      console.error("Erro ao criar evento:", error);
    }
  };

  const handleDeleteEvent = async (eventId: Id<"events">) => {
    if (confirm("Tem certeza que deseja eliminar este evento?")) {
      await deleteEvent({ id: eventId });
    }
  };

  const selectedDayEvents = selectedDate
    ? getEventsForDate(selectedDate.getDate())
    : [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Calendário</h1>
        <Button onClick={openNewEventDialog} disabled={!selectedDate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle>
                {MONTHS[month]} {year}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground p-2"
                  >
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="p-2" />;
                  }

                  const dayEvents = getEventsForDate(day);
                  const isSelected =
                    selectedDate?.getDate() === day &&
                    selectedDate?.getMonth() === month &&
                    selectedDate?.getFullYear() === year;
                  const isToday =
                    new Date().getDate() === day &&
                    new Date().getMonth() === month &&
                    new Date().getFullYear() === year;

                  return (
                    <div
                      key={day}
                      className={`p-2 min-h-[80px] border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : isToday
                          ? "bg-muted"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="text-sm font-medium">{day}</div>
                      <div className="space-y-1 mt-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event._id}
                            className={`text-xs p-1 rounded text-white truncate ${
                              EVENT_TYPE_COLORS[event.type]
                            }`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {selectedDate
                  ? `${selectedDate.getDate()} de ${
                      MONTHS[selectedDate.getMonth()]
                    }`
                  : "Selecione um dia"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum evento para este dia.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map((event) => (
                    <div
                      key={event._id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge
                            variant="secondary"
                            className={`mt-1 ${
                              EVENT_TYPE_COLORS[event.type]
                            } text-white`}
                          >
                            {event.type === "meeting"
                              ? "Reunião"
                              : event.type === "call"
                              ? "Chamada"
                              : event.type === "task"
                              ? "Tarefa"
                              : "Outro"}
                          </Badge>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteEvent(event._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {event.contactId && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {getContactName(event.contactId)}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {event.allDay
                            ? "Dia inteiro"
                            : `${new Date(event.startDate).toLocaleTimeString(
                                "pt-PT",
                                { hour: "2-digit", minute: "2-digit" }
                              )} - ${new Date(event.endDate).toLocaleTimeString(
                                "pt-PT",
                                { hour: "2-digit", minute: "2-digit" }
                              )}`}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}
                        {event.description && (
                          <p className="mt-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título *</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      type: value as "meeting" | "call" | "task" | "other",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Reunião</SelectItem>
                    <SelectItem value="call">Chamada</SelectItem>
                    <SelectItem value="task">Tarefa</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Contacto</label>
                <Select
                  value={formData.contactId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, contactId: value ?? "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar contacto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts?.map((contact) => (
                      <SelectItem key={contact._id} value={contact._id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Início *</label>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Fim *</label>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Localização</label>
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            {(formData.type === "meeting" || formData.type === "call") && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="createTask"
                  checked={formData.createTask}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, createTask: checked as boolean })
                  }
                />
                <label htmlFor="createTask" className="text-sm font-medium">
                  Criar tarefa associada
                </label>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Criar Evento</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
