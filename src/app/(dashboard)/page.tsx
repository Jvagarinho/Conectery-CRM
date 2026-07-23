"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, CheckSquare, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function DashboardPage() {
  const contacts = useQuery(api.contacts.listByUser);
  const deals = useQuery(api.deals.listByUser);
  const tasks = useQuery(api.tasks.listByUser);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const totalContacts = contacts?.length || 0;
  const totalDeals = deals?.length || 0;
  const pendingTasks = tasks?.filter((t) => t.status === "pending").length || 0;

  const activeDeals = deals?.filter(
    (d) => d.stage !== "closed_won" && d.stage !== "closed_lost"
  ) || [];
  const wonDeals = deals?.filter((d) => d.stage === "closed_won") || [];
  const lostDeals = deals?.filter((d) => d.stage === "closed_lost") || [];

  const totalValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);
  const lostValue = lostDeals.reduce((sum, d) => sum + d.value, 0);

  const conversionRate =
    totalDeals > 0 ? ((wonDeals.length / totalDeals) * 100).toFixed(1) : "0";

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contactos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals Ativos</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDeals.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas Pendentes
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Ganhos</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{wonDeals.length}</span>
                  <span className="text-muted-foreground ml-2">
                    {formatCurrency(wonValue)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span>Perdidos</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{lostDeals.length}</span>
                  <span className="text-muted-foreground ml-2">
                    {formatCurrency(lostValue)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <span>Em curso</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{activeDeals.length}</span>
                  <span className="text-muted-foreground ml-2">
                    {formatCurrency(totalValue)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks?.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(task.createdAt).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {task.status === "completed" ? "Concluída" : "Pendente"}
                  </span>
                </div>
              ))}
              {(!tasks || tasks.length === 0) && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma atividade recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
