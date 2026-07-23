"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Building2, Plus, Pencil, Trash2, Globe, Phone, Mail, MapPin } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

export default function CompaniesPage() {
  const companies = useQuery(api.companies.listByUser);
  const createCompany = useMutation(api.companies.create);
  const updateCompany = useMutation(api.companies.update);
  const deleteCompany = useMutation(api.companies.remove);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    website: "",
    phone: "",
    email: "",
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
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await updateCompany({ id: editingCompany._id, ...formData });
      } else {
        await createCompany(formData);
      }
      setIsDialogOpen(false);
      setEditingCompany(null);
      resetForm();
    } catch (error) {
      console.error("Erro ao guardar empresa:", error);
    }
  };

  const handleEdit = (company: any) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry || "",
      website: company.website || "",
      phone: company.phone || "",
      email: company.email || "",
      billingStreet: company.billingStreet || "",
      billingCity: company.billingCity || "",
      billingDistrict: company.billingDistrict || "",
      billingPostalCode: company.billingPostalCode || "",
      billingCountry: company.billingCountry || "",
      shippingStreet: company.shippingStreet || "",
      shippingCity: company.shippingCity || "",
      shippingDistrict: company.shippingDistrict || "",
      shippingPostalCode: company.shippingPostalCode || "",
      shippingCountry: company.shippingCountry || "",
      description: company.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: Id<"companies">) => {
    if (confirm("Tem certeza que deseja eliminar esta empresa?")) {
      await deleteCompany({ id });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      industry: "",
      website: "",
      phone: "",
      email: "",
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
      description: "",
    });
  };

  const openNewDialog = () => {
    setEditingCompany(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const formatAddress = (company: any, type: "billing" | "shipping") => {
    const prefix = type === "billing" ? "billing" : "shipping";
    const street = company[`${prefix}Street`];
    const city = company[`${prefix}City`];
    const district = company[`${prefix}District`];
    const postalCode = company[`${prefix}PostalCode`];
    const country = company[`${prefix}Country`];

    const parts = [
      street,
      district ? `${district}` : null,
      postalCode ? `${postalCode} ${city || ""}`.trim() : city,
      country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  if (!companies) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">A carregar...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Empresas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button onClick={openNewDialog} />}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? "Editar Empresa" : "Nova Empresa"}
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
                  <Label>Website</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
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
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

              {/* Details */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4 text-sm uppercase text-muted-foreground">
                  Detalhes
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Indústria</Label>
                    <Input
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="Ex: Tecnologia, Saúde, Finanças"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      placeholder="Informações adicionais sobre a empresa..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCompany ? "Guardar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma empresa encontrada.</p>
            <p className="text-sm">Crie a sua primeira empresa para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Card key={company._id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(company)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(company._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                {company.industry && (
                  <Badge variant="secondary">{company.industry}</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {company.website && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {company.phone}
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {company.email}
                  </div>
                )}
                {formatAddress(company, "billing") && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <div>
                      {company.billingStreet && <p>{company.billingStreet}</p>}
                      {(company.billingDistrict || company.billingPostalCode || company.billingCity) && (
                        <p>
                          {company.billingDistrict && `${company.billingDistrict}, `}
                          {company.billingPostalCode && `${company.billingPostalCode} `}
                          {company.billingCity}
                        </p>
                      )}
                      {company.billingCountry && <p>{company.billingCountry}</p>}
                    </div>
                  </div>
                )}
                {company.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {company.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
