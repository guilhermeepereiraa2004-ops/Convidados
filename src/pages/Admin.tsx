import { useState, useEffect } from 'react';
import { LogOut, Users, Edit2, Trash2, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [editingRsvp, setEditingRsvp] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        // 1. Fetch from Supabase (Source of Truth)
        const { data: supabaseData, error } = await supabase
          .from('rsvps')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching from Supabase:', error);
          
          // Only if Supabase fails, we fallback to localStorage
          const localData = localStorage.getItem('rsvp_list');
          const localRSVPs = localData ? JSON.parse(localData) : [];
          setRsvps(localRSVPs);
        } else {
          // If Supabase call is successful, we TRUST it, even if it's empty
          setRsvps(supabaseData || []);
        }
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Ggap121021') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      setError('');
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    setPassword('');
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      alert('Erro: ID do convidado não encontrado.');
      return;
    }

    if (!window.confirm('Tem certeza que deseja excluir esta confirmação?')) return;
    
    setIsDeleting(id);
    
    // Optimistic update
    setRsvps(prev => prev.filter(r => r.id !== id));

    try {
      // 1. Try to delete from Supabase
      const { error } = await supabase
        .from('rsvps')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 2. Delete from localStorage
      const localData = localStorage.getItem('rsvp_list');
      if (localData) {
        const localRSVPs = JSON.parse(localData);
        const updatedLocal = localRSVPs.filter((r: any) => r.id !== id);
        localStorage.setItem('rsvp_list', JSON.stringify(updatedLocal));
      }
    } catch (err) {
      console.error('Error deleting RSVP from Supabase:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRsvp) return;

    const id = editingRsvp.id;
    if (!id) {
      alert('Erro: ID do convidado não encontrado.');
      return;
    }

    try {
      // 1. Try to update in Supabase
      const { error } = await supabase
        .from('rsvps')
        .update({
          name: editingRsvp.name,
          attending: editingRsvp.attending,
          adults: editingRsvp.adults,
          children: editingRsvp.children,
          companions: editingRsvp.companions,
          message: editingRsvp.message
        })
        .eq('id', id);

      if (error) throw error;

      // 2. Update in localStorage
      const localData = localStorage.getItem('rsvp_list');
      if (localData) {
        const localRSVPs = JSON.parse(localData);
        const updatedLocal = localRSVPs.map((r: any) => 
          r.id === id ? editingRsvp : r
        );
        localStorage.setItem('rsvp_list', JSON.stringify(updatedLocal));
      }

      // 3. Update state
      setRsvps(prev => prev.map(r => r.id === id ? editingRsvp : r));
      setEditingRsvp(null);
      alert('Atualizado com sucesso!');
    } catch (err) {
      console.error('Error updating RSVP in Supabase:', err);
      
      // Fallback: Update locally anyway
      const localData = localStorage.getItem('rsvp_list');
      if (localData) {
        const localRSVPs = JSON.parse(localData);
        const updatedLocal = localRSVPs.map((r: any) => 
          r.id === id ? editingRsvp : r
        );
        localStorage.setItem('rsvp_list', JSON.stringify(updatedLocal));
      }
      setRsvps(prev => prev.map(r => r.id === id ? editingRsvp : r));
      setEditingRsvp(null);
      
      alert('Aviso: Atualizado localmente, mas houve um erro ao sincronizar com o servidor.');
    }
  };



  if (!isAuthenticated) {
    return (
      <main className="admin-login-page">
        <div className="login-card-centered">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Great Vibes', fontSize: '4rem', color: 'var(--primary)', margin: 0 }}>G & G</h2>
            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--text-light)', marginTop: '0.5rem' }}>Acesso Privado</p>
          </div>
          
          <h1 className="login-title" style={{ textAlign: 'center' }}>Acesso dos Noivos</h1>
          <p className="login-subtitle" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            Digite a senha para gerenciar seus convidados.
          </p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input 
                type="password" 
                className="form-control" 
                autoFocus
                placeholder="Senha de acesso"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', height: '4rem', borderRadius: '12px' }}
              />
              {error && <p style={{ color: 'var(--error)', marginTop: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}
            </div>
            <button type="submit" className="btn" style={{ width: '100%', height: '4rem', fontSize: '1.1rem', borderRadius: '12px' }}>Entrar no Painel</button>
          </form>
          
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, opacity: 0.7 }}>
              &larr; Voltar para o site
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const attendingCount = rsvps.filter(r => r.attending === 'yes').reduce((acc, curr) => {
    return acc + curr.adults + curr.children;
  }, 0);


  return (
    <div className="admin-layout">
      {/* Mobile Header (Visible only on small screens) */}
      <div className="mobile-only-header" style={{ 
        display: 'none', 
        padding: '1rem 1.5rem', 
        backgroundColor: 'var(--white)', 
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h2 style={{ fontFamily: 'Great Vibes', fontSize: '1.8rem', color: 'var(--primary)', margin: 0 }}>G & G</h2>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--error)' }}>
          <LogOut size={20} />
        </button>
      </div>

      {/* Sidebar (Hidden on mobile via CSS) */}
      <aside className="admin-sidebar">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'Great Vibes', fontSize: '2.5rem', color: 'var(--primary)' }}>G & G</h2>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-light)' }}>Painel Administrativo</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(138, 154, 134, 0.1)', color: 'var(--primary-dark)', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={20} />
            Convidados
          </div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--error)', borderColor: 'rgba(224, 122, 95, 0.2)' }}>
            <LogOut size={18} />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Olá, Noivos!</h1>
            <p style={{ color: 'var(--text-light)', margin: 0 }}>Acompanhe aqui as confirmações para o grande dia.</p>
          </div>
          <Link to="/" className="btn btn-secondary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>Ver Site Público</Link>
        </header>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(138, 154, 134, 0.1)', color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
            <div className="stat-info">
              <p>Total de Pessoas</p>
              <h3>{attendingCount}</h3>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(212, 196, 168, 0.2)', color: 'var(--secondary)' }}>
              <Check size={24} />
            </div>
            <div className="stat-info">
              <p>Confirmações</p>
              <h3>{rsvps.length}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(129, 178, 154, 0.1)', color: 'var(--success)' }}>
              <Edit2 size={24} />
            </div>
            <div className="stat-info">
              <p>Com Mensagem</p>
              <h3>{rsvps.filter(r => r.message).length}</h3>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Lista de Presença</h2>
          </div>

          <div className="table-wrapper">
            {rsvps.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
                <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Nenhuma confirmação recebida até o momento.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Convidado</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Qtd</th>
                    <th>Mensagem</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.slice().reverse().map((rsvp, idx) => (
                    <tr key={rsvp.id || idx}>
                      <td data-label="Data" style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
                        {new Date(rsvp.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td data-label="Convidado">
                        <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{rsvp.name}</div>
                        {rsvp.companions && rsvp.companions.length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                            + {rsvp.companions.join(', ')}
                          </div>
                        )}
                      </td>
                      <td data-label="Status">
                        <span className={`status-badge ${rsvp.attending === 'yes' ? 'status-confirmed' : 'status-declined'}`}>
                          {rsvp.attending === 'yes' ? 'Confirmado' : 'Não irá'}
                        </span>
                      </td>
                      <td data-label="Qtd" style={{ textAlign: 'center', fontWeight: 700 }}>
                        {rsvp.adults + (rsvp.children || 0)}
                      </td>
                      <td data-label="Mensagem" style={{ maxWidth: '250px' }}>
                        <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rsvp.message}>
                          {rsvp.message || '—'}
                        </div>
                      </td>
                      <td data-label="Ações">
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => setEditingRsvp({...rsvp})} className="btn-icon-round" title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(rsvp.id)} 
                            disabled={isDeleting === rsvp.id}
                            className="btn-icon-round" 
                            style={{ color: 'var(--error)' }}
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editingRsvp && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Editar Confirmação</h2>
                <button onClick={() => setEditingRsvp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={editingRsvp.name}
                    onChange={e => setEditingRsvp({...editingRsvp, name: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Presença</label>
                  <select 
                    className="form-control"
                    value={editingRsvp.attending}
                    onChange={e => setEditingRsvp({...editingRsvp, attending: e.target.value})}
                  >
                    <option value="yes">Sim, estarei presente</option>
                    <option value="no">Não poderei ir</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Adultos</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="0"
                      value={editingRsvp.adults}
                      onChange={e => setEditingRsvp({...editingRsvp, adults: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Crianças</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="0"
                      value={editingRsvp.children}
                      onChange={e => setEditingRsvp({...editingRsvp, children: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                {editingRsvp.attending === 'yes' && editingRsvp.companions && editingRsvp.companions.map((compName: string, cIdx: number) => (
                  <div key={cIdx} className="form-group">
                    <label className="form-label">Acompanhante {cIdx + 2}</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={compName}
                      onChange={e => {
                        const newComps = [...editingRsvp.companions];
                        newComps[cIdx] = e.target.value;
                        setEditingRsvp({...editingRsvp, companions: newComps});
                      }}
                    />
                  </div>
                ))}

                <div className="form-group">
                  <label className="form-label">Mensagem</label>
                  <textarea 
                    className="form-control" 
                    rows={3}
                    value={editingRsvp.message || ''}
                    onChange={e => setEditingRsvp({...editingRsvp, message: e.target.value})}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" onClick={() => setEditingRsvp(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn" style={{ flex: 1 }}>
                    <Check size={18} style={{ marginRight: '0.5rem' }} />
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
