
    import React, { useState, useMemo } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Badge } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import { useNavigate } from 'react-router-dom';
    import { Search, Eye, Edit, Trash2, AlertCircle, ArrowUpDown, ShieldCheck, ShieldOff, Users } from 'lucide-react';
    import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
      AlertDialogTrigger,
    } from "@/components/ui/alert-dialog";
    import { useToast } from '@/components/ui/use-toast';

    const AdminBetList = ({ bets, onEditBet, onDeleteBet }) => {
      const navigate = useNavigate();
      const { toast } = useToast();
      const [searchTerm, setSearchTerm] = useState('');
      const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });

      const sortedBets = useMemo(() => {
        let sortableBets = [...bets];
        if (sortConfig.key !== null) {
          sortableBets.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            if (['entry_fee', 'prize_pool', 'participants_count'].includes(sortConfig.key)) {
              valA = parseFloat(valA) || 0;
              valB = parseFloat(valB) || 0;
            } else if (['created_at', 'deadline', 'close_date', 'result_date'].includes(sortConfig.key)) {
              valA = new Date(valA || 0).getTime();
              valB = new Date(valB || 0).getTime();
            } else if (typeof valA === 'string') {
              valA = valA.toLowerCase();
              valB = valB.toLowerCase();
            } else if (typeof valA === 'boolean') {
                valA = valA ? 1 : 0;
                valB = valB ? 1 : 0;
            }


            if (valA < valB) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (valA > valB) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
          });
        }
        return sortableBets;
      }, [bets, sortConfig]);

      const filteredBets = sortedBets.filter(bet =>
        (bet.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bet.manager_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bet.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bet.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

      const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
      };

      const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
          return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50 inline-block" />;
      };
      
      const statusVariant = {
        'Aberta': 'success',
        'Encerrada': 'destructive',
        'Cancelada': 'warning',
        'Pendente': 'secondary',
        'Em Análise': 'info',
      };

      return (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-700 dark:text-slate-100">Lista de Apostas</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Visualize e gerencie todas as apostas criadas na plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar por título, gerente, status, categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-2 text-base rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            {filteredBets.length === 0 ? (
               <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow">
                <AlertCircle className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Nenhuma aposta encontrada</h3>
                <p className="text-slate-500 dark:text-slate-400">Não há apostas correspondentes aos seus critérios de busca.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('title')}>Título {getSortIndicator('title')}</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('status')}>Status {getSortIndicator('status')}</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('entry_fee')}>Entrada {getSortIndicator('entry_fee')}</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('prize_pool')}>Pot {getSortIndicator('prize_pool')}</th>
                       <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('participants_count')}>Apostadores {getSortIndicator('participants_count')}</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('is_public')}>Visibilidade {getSortIndicator('is_public')}</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('created_at')}>Criação {getSortIndicator('created_at')}</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredBets.map((bet) => (
                      <tr key={bet.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-100">{bet.title}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                           <Badge variant={statusVariant[bet.status] || 'secondary'} className="capitalize text-xs">
                            {bet.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">R$ {(bet.entry_fee || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">R$ {(bet.prize_pool || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 text-center">
                           <div className="flex items-center justify-start">
                             <Users className="h-4 w-4 mr-1 text-slate-500" /> {bet.participants_count || 0}
                           </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          {bet.is_public ? (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <ShieldCheck className="h-4 w-4 mr-1" /> Pública
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600 dark:text-red-400">
                              <ShieldOff className="h-4 w-4 mr-1" /> Privada
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{new Date(bet.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300 hover:text-primary" onClick={() => navigate(`/aposta/${bet.id}`)} title="Ver Aposta">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300 hover:text-amber-600" onClick={() => onEditBet(bet)} title="Editar Aposta">
                            <Edit className="h-4 w-4" />
                          </Button>
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" title="Excluir Aposta">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a aposta "{bet.title}"? Esta ação não pode ser desfeita e removerá todos os dados associados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDeleteBet(bet.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      );
    };

    export default AdminBetList;
  