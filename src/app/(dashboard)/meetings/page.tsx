"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Video,
  Trash2,
  CheckCircle,
  Circle,
} from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

const EVENT_TYPE_CONFIG = {
  meeting: {
    label: "Reunião",
    icon: Video,
    color: "bg-blue-100 text-blue-800",
    dotColor: "bg-blue-500",
  },
  call: {
    label: "Chamada",
    icon: Phone,
    color: "bg-green-100 text-green-800",
    dotColor: "bg-green-500",
  },
};

export default function MeetingsPage() {
  const events = useQuery(api.events.listByUser);
  const contacts = useQuery(api.contacts.listByUser);
  const deleteEvent = useMutation(api.events.remove);

  const [activeTab, setActiveTab] = useState("upcoming");

  const getContactName = (contactId?: string) => {
    if (!contactId || !contacts) return null;
    const contact = contacts.find((c) => c._id === contactId);
    return contact?.name || null;
  };

  const now = Date.now();

  const meetings =
    events?.filter((e) => e.type === "meeting" || e.type === "call") || [];

  const upcomingMeetings = meetings
    .filter((e) => e.startDate >= now)
    .sort((a, b) => a.startDate - b.startDate);

  const pastMeetings = meetings
    .filter((e) => e.startDate < now)
    .sort((a, b) => b.startDate - a.startDate);

  const todayMeetings = meetings.filter((e) => {
    const eventDate = new Date(e.startDate);
    const today = new Date();
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  });

  const handleDelete = async (eventId: Id<"events">) => {
    if (confirm("Tem certeza que deseja eliminar esta reunião?")) {
      await deleteEvent({ id: eventId });
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("pt-PT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const MeetingCard = ({ event }: { event: any }) => {
    const config = EVENT_TYPE_CONFIG[event.type as keyof typeof EVENT_TYPE_CONFIG] || EVENT_TYPE_CONFIG.meeting;
    const Icon = config.icon;
    const isPast = event.startDate < now;

    return (
      <Card className={isPast ? "opacity-60" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${config.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{event.title}</h3>
                  <Badge variant="secondary" className={config.color}>
                    {config.label}
                  </Badge>
                  {isPast && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      Passada
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.startDate)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {event.allDay
                      ? "Dia inteiro"
                      : `${formatTime(event.startDate)} - ${formatTime(event.endDate)}`}
                  </div>
                </div>
                {event.contactId && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {getContactName(event.contactId)}
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                )}
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleDelete(event._id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Reuniões</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />
          <span>Hoje: {todayMeetings.length}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">
            Próximas ({upcomingMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="today">
            Hoje ({todayMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Passadas ({pastMeetings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingMeetings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma reunião agendada.</p>
                <p className="text-sm">
                  Crie uma nova reunião no calendário.
                </p>
              </CardContent>
            </Card>
          ) : (
            upcomingMeetings.map((event) => (
              <MeetingCard key={event._id} event={event} />
            ))
          )}
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          {todayMeetings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma reunião para hoje.</p>
              </CardContent>
            </Card>
          ) : (
            todayMeetings.map((event) => (
              <MeetingCard key={event._id} event={event} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastMeetings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma reunião passada.</p>
              </CardContent>
            </Card>
          ) : (
            pastMeetings.map((event) => (
              <MeetingCard key={event._id} event={event} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
