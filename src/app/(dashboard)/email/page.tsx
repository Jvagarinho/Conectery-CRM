"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Mail,
  Send,
  FileText,
  Trash2,
  Plus,
  Search,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

const emailTemplates = [
  { value: "meeting_request", label: "Pedido de Reunião" },
  { value: "task_assignment", label: "Atribuição de Tarefa" },
  { value: "campaign", label: "Campanha" },
  { value: "follow_up", label: "Follow-up" },
  { value: "custom", label: "Personalizado" },
];

const templateSubjects: Record<string, string> = {
  meeting_request: "Pedido de Reunião",
  task_assignment: "Nova Tarefa Atribuída",
  campaign: "Campanha",
  follow_up: "Follow-up",
  custom: "",
};

const templateBodies: Record<string, string> = {
  meeting_request: `Olá,

Gostaria de agendar uma reunião para discutir os seguintes pontos:
- [Assunto da reunião]

Por favor, indique a sua disponibilidade para esta semana.

Cumprimentos,
[O seu nome]`,
  task_assignment: `Olá,

Foi-lhe atribuída uma nova tarefa:
[Descrição da tarefa]

Prazo: [Data]

Por favor, confirme o recebimento.

Cumprimentos,
[O seu nome]`,
  campaign: `Olá,

[Conteúdo da campanha]

Se tiver alguma dúvida, não hesite em contactar-nos.

Cumprimentos,
[O seu nome]`,
  follow_up: `Olá,

Espero que se encontre bem.

Gostaria de fazer um follow-up relativamente a [assunto].

Podemos agendar uma chamada para discutir?

Cumprimentos,
[O seu nome]`,
  custom: "",
};

export default function EmailPage() {
  const emails = useQuery(api.emails.listByUser);
  const contacts = useQuery(api.contacts.listByUser);
  const createEmail = useMutation(api.emails.create);
  const deleteEmail = useMutation(api.emails.remove);

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("drafts");
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  const [formData, setFormData] = useState({
    to: "",
    contactId: "" as string,
    subject: "",
    body: "",
    template: "custom" as string,
  });

  const handleTemplateChange = (template: string | null) => {
    const t = template || "custom";
    setFormData({
      ...formData,
      template: t,
      subject: templateSubjects[t] || "",
      body: templateBodies[t] || "",
    });
  };

  const handleContactSelect = (contactId: string | null) => {
    if (!contactId) return;
    const contact = contacts?.find((c) => c._id === contactId);
    if (contact?.email) {
      setFormData({
        ...formData,
        contactId,
        to: contact.email,
      });
    }
  };

  const openEmailClient = () => {
    const subject = encodeURIComponent(formData.subject);
    const body = encodeURIComponent(formData.body);
    const to = encodeURIComponent(formData.to);
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_blank");
  };

  const handleSaveDraft = async () => {
    try {
      await createEmail({
        to: formData.to,
        contactId: (formData.contactId as Id<"contacts">) || undefined,
        subject: formData.subject,
        body: formData.body,
        htmlBody: formData.body,
        template: formData.template as any,
      });
      setIsComposeOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao guardar rascunho:", error);
    }
  };

  const handleSendFromDraft = (email: any) => {
    const subject = encodeURIComponent(email.subject);
    const body = encodeURIComponent(email.body);
    const to = encodeURIComponent(email.to);
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_blank");
  };

  const handleDelete = async (id: Id<"emails">) => {
    if (confirm("Tem certeza que deseja eliminar este e-mail?")) {
      await deleteEmail({ id });
    }
  };

  const resetForm = () => {
    setFormData({
      to: "",
      contactId: "",
      subject: "",
      body: "",
      template: "custom",
    });
  };

  const draftEmails = emails?.filter((e) => e.status === "draft") || [];
  const sentEmails = emails?.filter((e) => e.status === "sent") || [];

  const filteredDrafts = draftEmails.filter(
    (e) =>
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.to.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSent = sentEmails.filter(
    (e) =>
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.to.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const EmailList = ({
    emails,
    showSendButton,
  }: {
    emails: any[];
    showSendButton?: boolean;
  }) => (
    <div className="space-y-2">
      {emails.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum e-mail encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        emails.map((email) => (
          <Card
            key={email._id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => setSelectedEmail(email)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{email.subject}</h3>
                    {email.template && (
                      <Badge variant="secondary" className="text-xs">
                        {emailTemplates.find((t) => t.value === email.template)
                          ?.label || email.template}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Para: {email.to}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(email.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {email.status === "sent" && (
                    <Badge className="bg-green-100 text-green-800">
                      <Send className="h-3 w-3 mr-1" />
                      Enviado
                    </Badge>
                  )}
                  {showSendButton && email.status === "draft" && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendFromDraft(email);
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Abrir no Email
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(email._id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">E-mails</h1>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger render={<Button onClick={resetForm} />}>
            <Plus className="h-4 w-4 mr-2" />
            Novo E-mail
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Compor E-mail</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Modelo</Label>
                <Select
                  value={formData.template}
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Contacto</Label>
                <Select
                  value={formData.contactId}
                  onValueChange={handleContactSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar contacto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts?.map((contact) => (
                      <SelectItem key={contact._id} value={contact._id}>
                        {contact.name} ({contact.email || "sem email"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Para *</Label>
                <Input
                  type="email"
                  value={formData.to}
                  onChange={(e) =>
                    setFormData({ ...formData, to: e.target.value })
                  }
                  placeholder="destinatario@email.com"
                  required
                />
              </div>
              <div>
                <Label>Assunto *</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Corpo do E-mail *</Label>
                <Textarea
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  rows={10}
                  required
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <FileText className="h-4 w-4 mr-2" />
                  Guardar Rascunho
                </Button>
                <Button
                  onClick={openEmailClient}
                  disabled={!formData.to || !formData.subject}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir no Cliente de Email
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar e-mails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="drafts">
            <FileText className="h-4 w-4 mr-2" />
            Rascunhos ({draftEmails.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            <Send className="h-4 w-4 mr-2" />
            Enviados ({sentEmails.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafts">
          <EmailList emails={filteredDrafts} showSendButton />
        </TabsContent>

        <TabsContent value="sent">
          <EmailList emails={filteredSent} />
        </TabsContent>
      </Tabs>

      {selectedEmail && (
        <Dialog
          open={!!selectedEmail}
          onOpenChange={() => setSelectedEmail(null)}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedEmail.subject}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  <strong>Para:</strong> {selectedEmail.to}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatDate(selectedEmail.createdAt)}
              </div>
              <div className="border rounded-lg p-4 whitespace-pre-wrap text-sm">
                {selectedEmail.body}
              </div>
              {selectedEmail.status === "draft" && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        to: selectedEmail.to,
                        contactId: selectedEmail.contactId || "",
                        subject: selectedEmail.subject,
                        body: selectedEmail.body,
                        template: selectedEmail.template || "custom",
                      });
                      setSelectedEmail(null);
                      setIsComposeOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button onClick={() => handleSendFromDraft(selectedEmail)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir no Email
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
