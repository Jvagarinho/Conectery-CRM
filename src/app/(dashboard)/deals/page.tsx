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
import { Plus, DollarSign, Pencil, Trash2 } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

const stages = [
  { value: "qualification", label: "Qualificação", color: "bg-blue-500" },
  { value: "proposal", label: "Proposta", color: "bg-yellow-500" },
  { value: "negotiation", label: "Negociação", color: "bg-orange-500" },
  { value: "closed_won", label: "Ganho", color: "bg-green-500" },
  { value: "closed_lost", label: "Perdido", color: "bg-red-500" },
];

export default function DealsPage() {
  const deals = useQuery(api.deals.listByUser);
  const contacts = useQuery(api.contacts.listByUser);
  const createDeal = useMutation(api.deals.create);
  const updateDeal = useMutation(api.deals.update);
  const deleteDeal = useMutation(api.deals.remove);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Id<"deals"> | null>(null);

  const [formData, setFormData] = useState({
    contactId: "" as string,
    title: "",
    value: 0,
    stage: "qualification" as
      | "qualification"
      | "proposal"
      | "negotiation"
      | "closed_won"
      | "closed_lost",
    expectedCloseDate: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      contactId: formData.contactId as Id<"contacts">,
      title: formData.title,
      value: formData.value,
      stage: formData.stage,
      expectedCloseDate: formData.expectedCloseDate
        ? new Date(formData.expectedCloseDate).getTime()
        : undefined,
      notes: formData.notes || undefined,
    };

    if (editingDeal) {
      await updateDeal({ id: editingDeal, ...data });
    } else {
      await createDeal(data);
    }
    setIsDialogOpen(false);
    setEditingDeal(null);
    setFormData({
      contactId: "",
      title: "",
      value: 0,
      stage: "qualification",
      expectedCloseDate: "",
      notes: "",
    });
  };

  const handleEdit = (deal: NonNullable<typeof deals>[0]) => {
    setEditingDeal(deal._id);
    setFormData({
      contactId: deal.contactId,
      title: deal.title,
      value: deal.value,
      stage: deal.stage,
      expectedCloseDate: deal.expectedCloseDate
        ? new Date(deal.expectedCloseDate).toISOString().split("T")[0]
        : "",
      notes: deal.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: Id<"deals">) => {
    if (confirm("Tem certeza que deseja eliminar este deal?")) {
      await deleteDeal({ id });
    }
  };

  const handleMoveToStage = async (
    id: Id<"deals">,
    stage: "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost"
  ) => {
    await updateDeal({ id, stage });
  };

  const getStageStyle = (stage: string) => {
    return stages.find((s) => s.value === stage)?.color || "bg-gray-500";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Deals</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Deal
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingDeal ? "Editar Deal" : "Novo Deal"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="contactId">Contacto *</Label>
                <Select
                  value={formData.contactId}
                  onValueChange={(value) => {
                    if (value) setFormData({ ...formData, contactId: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar contacto" />
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
                <Label htmlFor="value">Valor (€) *</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="stage">Estágio</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => {
                    if (value) {
                      setFormData({ ...formData, stage: value as typeof formData.stage });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expectedCloseDate">
                  Data Prevista de Fecho
                </Label>
                <Input
                  id="expectedCloseDate"
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedCloseDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                {editingDeal ? "Guardar" : "Criar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageDeals = deals?.filter((d) => d.stage === stage.value);
          const totalValue = stageDeals?.reduce((sum, d) => sum + d.value, 0) || 0;

          return (
            <div key={stage.value} className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${stage.color}`}
                  />
                  <h3 className="font-semibold text-sm">{stage.label}</h3>
                </div>
                <Badge variant="secondary">{stageDeals?.length || 0}</Badge>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                {formatCurrency(totalValue)}
              </p>
              <div className="space-y-2">
                {stageDeals?.map((deal) => (
                  <Card key={deal._id} className="cursor-pointer hover:shadow-md">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{deal.title}</h4>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleEdit(deal)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleDelete(deal._id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(deal.value)}
                      </div>
                      {stage.value !== "closed_won" &&
                        stage.value !== "closed_lost" && (
                          <Select
                            value={deal.stage}
                            onValueChange={(value) => {
                              if (value) {
                                handleMoveToStage(
                                  deal._id,
                                  value as "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost"
                                );
                              }
                            }}
                          >
                            <SelectTrigger className="h-7 text-xs mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {stages.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
