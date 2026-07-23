"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserButton } from "@clerk/nextjs";
import { Users, Shield, Settings as SettingsIcon, Check, X } from "lucide-react";

function AdminUsersList() {
  const users = useQuery(api.users.listAll);
  const updateRole = useMutation(api.users.updateRole);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"admin" | "commercial">("commercial");

  if (!users) return <p className="text-muted-foreground">A carregar...</p>;

  const handleSaveRole = async (userId: string) => {
    try {
      await updateRole({ userId: userId as any, role: selectedRole });
      setEditingUserId(null);
    } catch (error) {
      console.error("Erro ao atualizar role:", error);
    }
  };

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user._id}
          className="flex items-center justify-between border-b pb-2"
        >
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {editingUserId === user._id ? (
              <>
                <Select
                  value={selectedRole}
                  onValueChange={(value) =>
                    setSelectedRole(value as "admin" | "commercial")
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="commercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleSaveRole(user._id)}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingUserId(null)}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </>
            ) : (
              <>
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                >
                  {user.role === "admin" ? "Admin" : "Comercial"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingUserId(user._id);
                    setSelectedRole(user.role);
                  }}
                >
                  Alterar
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function BecomeAdminButton() {
  const makeAdmin = useMutation(api.users.makeAdmin);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleBecomeAdmin = async () => {
    try {
      setError(null);
      await makeAdmin();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (success) {
    return (
      <p className="text-sm text-green-600">
        Agora é administrador! Recarregue a página.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" onClick={handleBecomeAdmin}>
        Tornar-me Administrador
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <UserButton />
                <div>
                  <p className="font-medium">{currentUser?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
              <Badge
                variant={currentUser?.role === "admin" ? "default" : "secondary"}
              >
                {currentUser?.role === "admin"
                  ? "Administrador"
                  : "Comercial"}
              </Badge>

              {currentUser?.role !== "admin" && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Se for o único utilizador, pode tornar-se administrador:
                  </p>
                  <BecomeAdminButton />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {currentUser?.role === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestão de Utilizadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminUsersList />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Administrador:</strong> Acesso total a todos os dados,
                gestão de utilizadores e configurações
              </p>
              <p className="text-sm">
                <strong>Comercial:</strong> Acesso apenas aos seus próprios
                contactos, deals e tarefas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
