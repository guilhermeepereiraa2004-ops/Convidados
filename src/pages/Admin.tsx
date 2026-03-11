import { useState, useEffect } from 'react';
import { Lock, LogOut, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rsvps, setRsvps] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      const data = localStorage.getItem('rsvp_list');
      if (data) {
        setRsvps(JSON.parse(data));
      }
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1207') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };



  if (!isAuthenticated) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div style={{ padding: '4rem 2rem' }}>
          <h1 className="text-center mb-4">Acesso dos Noivos</h1>
          <div className="card">
            <div className="text-center mb-4">
              <Lock size={48} color="var(--primary)" style={{ margin: '0 auto' }} />
              <p className="mt-2" style={{ color: 'var(--text-light)' }}>
                Digite a senha de acesso (Dica: é a data do casamento sem as barras: 1207)
              </p>
            </div>
            
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input 
                  type="password" 
                  className="form-control" 
                  autoFocus
                  placeholder="Senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px' }}
                />
                {error && <p style={{ color: 'var(--error)', marginTop: '0.5rem', textAlign: 'center' }}>{error}</p>}
              </div>
              <button type="submit" className="btn" style={{ width: '100%' }}>Acessar Painel</button>
            </form>
            <div className="text-center mt-4">
              <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Voltar ao Início</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const attendingCount = rsvps.filter(r => r.attending === 'yes').reduce((acc, curr) => {
    return acc + curr.adults + curr.children;
  }, 0);

  const declinedCount = rsvps.filter(r => r.attending === 'no').length;

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="admin-container" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Lista de Convidados</h1>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Link to="/" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Ver Site</Link>
              <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', backgroundColor: 'var(--error)', color: 'white' }}>
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'var(--primary)', padding: '1rem', borderRadius: '50%', color: 'white' }}>
              <Users size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Confirmados</p>
              <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{attendingCount}</h2>
            </div>
          </div>
          
          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'var(--error)', padding: '1rem', borderRadius: '50%', color: 'white' }}>
              <Users size={32} style={{ transform: 'scaleX(-1)' }} />
            </div>
            <div>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Não Comparecerão</p>
              <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{declinedCount}</h2>
            </div>
          </div>
        </div>

        <div className="card" style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Acompanhamento de Confirmações</h2>
          </div>
          
          {rsvps.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
              <p>Nenhum convidado confirmou presença ainda.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                   <th>Nome</th>
                   <th>Status</th>
                   <th>Mensagem</th>
                 </tr>
               </thead>
               <tbody>
                 {rsvps.slice().reverse().map((rsvp, idx) => (
                   <tr key={idx}>
                     <td style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>
                       {new Date(rsvp.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                     </td>
                     <td style={{ fontWeight: 500 }}>{rsvp.name}</td>
                     <td>
                       {rsvp.attending === 'yes' ? (
                          <span className="status-badge status-confirmed">Sim</span>
                       ) : (
                          <span className="status-badge status-declined">Não</span>
                       )}
                     </td>
                     <td style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-light)' }}>
                       {rsvp.message || '-'}
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
