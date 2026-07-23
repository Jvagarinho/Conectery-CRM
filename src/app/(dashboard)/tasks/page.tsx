"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  Check,
  Trash2,
  Clock,
  MapPin,
  Link,
} from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

const taskTypes = [
  { value: "call", label: "Chamada", icon: Phone, color: "bg-blue-100 text-blue-800" },
  { value: "email", label: "Email", icon: Mail, color: "bg-purple-100 text-purple-800" },
  { value: "meeting", label: "Reunião", icon: Calendar, color: "bg-green-100 text-green-800" },
  { value: "task", label: "Tarefa", icon: CheckSquare, color: "bg-orange-100 text-orange-800" },
];

export default function TasksPage() {
  const tasks = useQuery(api.tasks.listByUser);
  const contacts = useQuery(api.contacts.listByUser);
  const createTask = useMutation(api.tasks.create);
  const completeTask = useMutation(api.tasks.complete);
  const deleteTask = useMutation(api.tasks.remove);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  const [formData, setFormData] = useState({
    title: "",
    type: "task" as "call" | "email" | "meeting" | "task",
    contactId: "" as string,
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask({
      title: formData.title,
      type: formData.type,
      contactId: formData.contactId
        ? (formData.contactId as Id<"contacts">)
        : undefined,
      dueDate: formData.dueDate || undefined,
    });
    setIsDialogOpen(false);
    setFormData({
      title: "",
      type: "task",
      contactId: "",
      dueDate: "",
    });
  };

  const handleComplete = async (id: Id<"tasks">) => {
    await completeTask({ id });
  };

  const handleDelete = async (id: Id<"tasks">) => {
    if (confirm("Tem certeza que deseja eliminar esta tarefa?")) {
      await deleteTask({ id });
    }
  };

  const getTaskTypeStyle = (type: string) => {
    return taskTypes.find((t) => t.value === type)?.color || "bg-gray-100";
  };

  const getTaskTypeIcon = (type: string) => {
    const Icon = taskTypes.find((t) => t.value === type)?.icon || CheckSquare;
    return Icon;
  };

  const pendingTasks = tasks?.filter((t) => t.status === "pending") || [];
  const completedTasks = tasks?.filter((t) => t.status === "completed") || [];

  const displayTasks = activeTab === "pending" ? pendingTasks : completedTasks;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tarefas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => {
                    if (value) {
                      setFormData({ ...formData, type: value as typeof formData.type });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contactId">Contacto</Label>
                <Select
                  value={formData.contactId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, contactId: value ?? "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar contacto (opcional)" />
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
              <div>
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                Criar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Pendentes ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídas ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma tarefa pendente
            </div>
          ) : (
            pendingTasks.map((task) => {
              const Icon = getTaskTypeIcon(task.type);
              return (
                <Card key={task._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${getTaskTypeStyle(task.type)}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{task.title}</h3>
                            {task.eventId && (
                              <Badge variant="secondary" className="text-xs">
                                <Link className="h-3 w-3 mr-1" />
                                Calendário
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {taskTypes.find((t) => t.value === task.type)
                                ?.label}
                            </Badge>
                            {task.dueDate && (
                              <span>
                                Vence:{" "}
                                {new Date(task.dueDate).toLocaleDateString(
                                  "pt-PT"
                                )}
                              </span>
                            )}
                          </div>
                          {task.event && (
                            <div className="mt-2 text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(task.event.startDate).toLocaleTimeString(
                                  "pt-PT",
                                  { hour: "2-digit", minute: "2-digit" }
                                )}{" "}
                                -{" "}
                                {new Date(task.event.endDate).toLocaleTimeString(
                                  "pt-PT",
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </div>
                              {task.event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {task.event.location}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleComplete(task._id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(task._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma tarefa concluída
            </div>
          ) : (
            completedTasks.map((task) => {
              const Icon = getTaskTypeIcon(task.type);
              return (
                <Card key={task._id} className="opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${getTaskTypeStyle(task.type)}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium line-through">
                              {task.title}
                            </h3>
                            {task.eventId && (
                              <Badge variant="secondary" className="text-xs">
                                <Link className="h-3 w-3 mr-1" />
                                Calendário
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {taskTypes.find((t) => t.value === task.type)
                                ?.label}
                            </Badge>
                            {task.completedAt && (
                              <span>
                                Concluída:{" "}
                                {new Date(task.completedAt).toLocaleDateString(
                                  "pt-PT"
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(task._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
