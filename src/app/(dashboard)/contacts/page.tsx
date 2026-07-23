"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search, Pencil, Trash2, MapPin } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

const statusOptions = [
  { value: "lead", label: "Lead", color: "bg-blue-100 text-blue-800" },
  { value: "prospect", label: "Prospecto", color: "bg-yellow-100 text-yellow-800" },
  { value: "client", label: "Cliente", color: "bg-green-100 text-green-800" },
  { value: "inactive", label: "Inativo", color: "bg-gray-100 text-gray-800" },
];

export default function ContactsPage() {
  const contacts = useQuery(api.contacts.listByUser);
  const companies = useQuery(api.companies.listByUser);
  const createContact = useMutation(api.contacts.create);
  const updateContact = useMutation(api.contacts.update);
  const deleteContact = useMutation(api.contacts.remove);

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Id<"contacts"> | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyId: "" as string,
    company: "",
    billingStreet: "",
    billingCity: "",
    billingDistrict: "",
    billingPostalCode: "",
    billingCountry: "",
    shippingStreet: "",
    shippingCity: "",
    shippingDistrict: "",
    shippingPostalCode: "",
    shippingCountry: "",
    status: "lead" as "lead" | "prospect" | "client" | "inactive",
    source: "",
    notes: "",
  });

  const filteredContacts = contacts?.filter(
    (contact) =>
      contact.name.toLowerCase().includes(search.toLowerCase()) ||
      contact.email?.toLowerCase().includes(search.toLowerCase()) ||
      contact.company?.toLowerCase().includes(search.toLowerCase())
  );

  const getCompanyName = (companyId?: string) => {
    if (!companyId || !companies) return null;
    const company = companies.find((c) => c._id === companyId);
    return company?.name || null;
  };

  const formatAddress = (contact: any, type: "billing" | "shipping") => {
    const prefix = type === "billing" ? "billing" : "shipping";
    const street = contact[`${prefix}Street`];
    const city = contact[`${prefix}City`];
    const district = contact[`${prefix}District`];
    const postalCode = contact[`${prefix}PostalCode`];
    const country = contact[`${prefix}Country`];

    const parts = [
      street,
      district ? `${district}` : null,
      postalCode ? `${postalCode} ${city || ""}`.trim() : city,
      country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      companyId: (formData.companyId as Id<"companies">) || undefined,
      company: formData.company || undefined,
      billingStreet: formData.billingStreet || undefined,
      billingCity: formData.billingCity || undefined,
      billingDistrict: formData.billingDistrict || undefined,
      billingPostalCode: formData.billingPostalCode || undefined,
      billingCountry: formData.billingCountry || undefined,
      shippingStreet: formData.shippingStreet || undefined,
      shippingCity: formData.shippingCity || undefined,
      shippingDistrict: formData.shippingDistrict || undefined,
      shippingPostalCode: formData.shippingPostalCode || undefined,
      shippingCountry: formData.shippingCountry || undefined,
      status: formData.status,
      source: formData.source || undefined,
      notes: formData.notes || undefined,
    };

    if (editingContact) {
      await updateContact({ id: editingContact, ...submitData });
    } else {
      await createContact(submitData);
    }
    setIsDialogOpen(false);
    setEditingContact(null);
    resetForm();
  };

  const handleEdit = (contact: NonNullable<typeof contacts>[0]) => {
    setEditingContact(contact._id);
    setFormData({
      name: contact.name,
      email: contact.email || "",
      phone: contact.phone || "",
      companyId: contact.companyId || "",
      company: contact.company || "",
      billingStreet: contact.billingStreet || "",
      billingCity: contact.billingCity || "",
      billingDistrict: contact.billingDistrict || "",
      billingPostalCode: contact.billingPostalCode || "",
      billingCountry: contact.billingCountry || "",
      shippingStreet: contact.shippingStreet || "",
      shippingCity: contact.shippingCity || "",
      shippingDistrict: contact.shippingDistrict || "",
      shippingPostalCode: contact.shippingPostalCode || "",
      shippingCountry: contact.shippingCountry || "",
      status: contact.status,
      source: contact.source || "",
      notes: contact.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: Id<"contacts">) => {
    if (confirm("Tem certeza que deseja eliminar este contacto?")) {
      await deleteContact({ id });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      companyId: "",
      company: "",
      billingStreet: "",
      billingCity: "",
      billingDistrict: "",
      billingPostalCode: "",
      billingCountry: "",
      shippingStreet: "",
      shippingCity: "",
      shippingDistrict: "",
      shippingPostalCode: "",
      shippingCountry: "",
      status: "lead",
      source: "",
      notes: "",
    });
  };

  const getStatusStyle = (status: string) => {
    return statusOptions.find((s) => s.value === status)?.color || "bg-gray-100";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Contactos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contacto
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingContact ? "Editar Contacto" : "Novo Contacto"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Telemóvel</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Empresa</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={(value) => {
                      const selectedCompany = companies?.find((c) => c._id === value);
                      setFormData({
                        ...formData,
                        companyId: value ?? "",
                        company: selectedCompany?.name || "",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar empresa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companies?.map((company) => (
                        <SelectItem key={company._id} value={company._id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => {
                      if (value === "lead" || value === "prospect" || value === "client" || value === "inactive") {
                        setFormData({ ...formData, status: value });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="prospect">Prospecto</SelectItem>
                      <SelectItem value="client">Cliente</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Origem</Label>
                  <Input
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="Ex: Website, Referência, LinkedIn"
                  />
                </div>
              </div>

              {/* Endereço de Faturação */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4 text-sm uppercase text-muted-foreground">
                  Endereço de faturação
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Rua</Label>
                    <Input
                      value={formData.billingStreet}
                      onChange={(e) => setFormData({ ...formData, billingStreet: e.target.value })}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      value={formData.billingCity}
                      onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Distrito</Label>
                    <Input
                      value={formData.billingDistrict}
                      onChange={(e) => setFormData({ ...formData, billingDistrict: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Código postal</Label>
                    <Input
                      value={formData.billingPostalCode}
                      onChange={(e) => setFormData({ ...formData, billingPostalCode: e.target.value })}
                      placeholder="0000-000"
                    />
                  </div>
                  <div>
                    <Label>País</Label>
                    <Input
                      value={formData.billingCountry}
                      onChange={(e) => setFormData({ ...formData, billingCountry: e.target.value })}
                      placeholder="Portugal"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço de Envio */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4 text-sm uppercase text-muted-foreground">
                  Endereço de envio
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Rua</Label>
                    <Input
                      value={formData.shippingStreet}
                      onChange={(e) => setFormData({ ...formData, shippingStreet: e.target.value })}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      value={formData.shippingCity}
                      onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Distrito</Label>
                    <Input
                      value={formData.shippingDistrict}
                      onChange={(e) => setFormData({ ...formData, shippingDistrict: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Código postal</Label>
                    <Input
                      value={formData.shippingPostalCode}
                      onChange={(e) => setFormData({ ...formData, shippingPostalCode: e.target.value })}
                      placeholder="0000-000"
                    />
                  </div>
                  <div>
                    <Label>País</Label>
                    <Input
                      value={formData.shippingCountry}
                      onChange={(e) => setFormData({ ...formData, shippingCountry: e.target.value })}
                      placeholder="Portugal"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Notas</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                {editingContact ? "Guardar" : "Criar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar contactos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Telefone</th>
              <th className="text-left p-4">Empresa</th>
              <th className="text-left p-4">Morada</th>
              <th className="text-left p-4">Estado</th>
              <th className="text-left p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts?.map((contact) => (
              <tr key={contact._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{contact.name}</td>
                <td className="p-4 text-gray-600">{contact.email || "-"}</td>
                <td className="p-4 text-gray-600">{contact.phone || "-"}</td>
                <td className="p-4 text-gray-600">
                  {getCompanyName(contact.companyId) || contact.company || "-"}
                </td>
                <td className="p-4 text-gray-600">
                  {formatAddress(contact, "billing") ? (
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground" />
                      <span className="text-xs">{formatAddress(contact, "billing")}</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      contact.status
                    )}`}
                  >
                    {statusOptions.find((s) => s.value === contact.status)?.label}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(contact)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredContacts?.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Nenhum contacto encontrado
          </div>
        )}
      </div>
    </div>
  );
}
