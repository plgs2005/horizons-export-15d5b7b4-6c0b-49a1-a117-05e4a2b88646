
    import React, { useState } from 'react';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
    import { Search, UserCheck, Ban, Edit3, Trash2, Loader2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { updateUserStatus } from '@/lib/supabase.jsx'; // Assuming updateUser is in supabase.js to update profile

    const UserManagementTable = ({ users, setUsers }) => {
      const { toast } = useToast();
      const [searchTerm, setSearchTerm] = useState('');
      const [actionLoading, setActionLoading] = useState(null); // userId for loading state

      const handleUserStatusChange = async (userId, newStatus) => {
        setActionLoading(userId);
        try {
          const updatedProfile = await updateUserStatus(userId, newStatus);
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.id === userId ? { ...user, is_active: updatedProfile.is_active } : user
            )
          );
          toast({
            title: newStatus ? "Usuário Ativado" : "Usuário Suspenso",
            description: `O status do usuário foi atualizado com sucesso.`,
          });
        } catch (error) {
          console.error("Error updating user status:", error);
          toast({
            variant: "destructive",
            title: "Erro ao Atualizar Status",
            description: error.message || "Não foi possível atualizar o status do usuário.",
          });
        } finally {
          setActionLoading(null);
        }
      };
      
      const filteredUsers = users.filter(user => 
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.role || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

      return (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-700">Usuários Registrados</CardTitle>
            <CardDescription className="text-slate-500">Gerencie os usuários da plataforma, seus status e permissões.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar por nome, email ou função..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-2 text-base rounded-lg border-slate-300 focus:border-primary focus:ring-primary"
                />
              </div>
              {/* Add user button can be added here if needed */}
            </div>
            <div className="rounded-lg border border-slate-200 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuário</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Função</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Chave PIX</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || `https://avatar.vercel.sh/${user.email}.png`} alt={user.name} />
                            <AvatarFallback>{(user.name || user.email || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{user.name || 'N/A'}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.is_active ? 'success' : 'destructive'} className="capitalize">
                          {user.is_active ? 'Ativo' : 'Suspenso'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">
                        {user.role || 'Participante'}
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {user.pix_key ? 'Sim' : 'Não'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="space-x-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800" disabled={actionLoading === user.id}>
                                {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : user.is_active ? <Ban className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Você tem certeza que deseja {user.is_active ? 'suspender' : 'ativar'} este usuário?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUserStatusChange(user.id, !user.is_active)} className={user.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}>
                                  {user.is_active ? 'Suspender' : 'Ativar'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800" onClick={() => toast({title: "Em Breve", description: "Funcionalidade de editar usuário será implementada."})}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                           <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => toast({title: "Em Breve", description: "Funcionalidade de deletar usuário será implementada."})}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
             {filteredUsers.length === 0 && (
              <p className="text-center text-slate-500 mt-6 py-4 bg-slate-50 rounded-md">Nenhum usuário encontrado com os critérios de busca.</p>
            )}
          </CardContent>
        </Card>
      );
    };

    export default UserManagementTable;
  