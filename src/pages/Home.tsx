import { useState, useEffect } from 'react';
import { Heart, Calendar, MapPin, Check, Gift } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    attending: 'yes',
    adults: 1,
    children: 0,
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hide loader after 2.5s
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEntry = {
      ...formData,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };

    // 1. Save to Supabase (if configured)
    const { error } = await supabase
      .from('rsvps')
      .insert([newEntry]);

    if (error) {
      console.error('Error saving to Supabase:', error);
    }
    
    // 2. Fallback/Local Copy: Save to localStorage
    const existing = localStorage.getItem('rsvp_list');
    const rsvpList = existing ? JSON.parse(existing) : [];
    localStorage.setItem('rsvp_list', JSON.stringify([...rsvpList, newEntry]));
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen">
        <header className="hero">
          <div className="container" style={{ justifyContent: 'center' }}>
            <div className="card text-center animate-fade-in" style={{ width: '100%', maxWidth: '600px' }}>
              <Heart size={48} className="mb-3" color="var(--primary)" style={{ margin: '0 auto' }} />
              <h2 style={{ color: 'var(--primary-dark)' }}>Obrigado!</h2>
              <p className="mt-4 mb-4" style={{ color: 'var(--text-light)' }}>
                Sua resposta foi registrada com sucesso. Estamos ansiosos para celebrar este dia especial com você!
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                <a 
                  href="https://enxovalgeg.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn"
                  style={{ width: '100%' }}
                >
                  <Gift size={20} />
                  Ver Lista de Enxoval
                </a>
                <button className="btn btn-secondary" onClick={() => window.location.reload()}>
                  Nova Resposta
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Floating Gift Button */}
        <a 
          href="https://enxovalgeg.vercel.app/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="fab-gift-container"
        >
          <div className="fab-gift-pulse"></div>
          <div className="fab-gift">
            <Gift size={20} />
            <span>Deseja nos presentear?</span>
          </div>
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Loader Overlay */}
      <div className={`loader-overlay ${!loading ? 'hidden' : ''}`}>
        <div className="loader-date">12/07</div>
        <div className="loader-line"></div>
        <div className="loader-monogram">G & G</div>
      </div>

      <header className="hero">
        {/* Animated Background Petals */}
        <div className="petals-container">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`petal petal-${i + 1}`}></div>
          ))}
        </div>
        
        <div className="container">
          <div className="hero-text animate-fade-in delay-1">
            <h1 className="hero-title">
              Gabrielle
              <span className="hero-ampersand">&</span>
              Guilherme
            </h1>
            <div className="hero-details">
              <div className="hero-tags-container">
                <div className="hero-tag">
                  <Calendar size={18} />
                  <span>12 de Julho de 2026</span>
                </div>
                <div className="hero-tag">
                  <MapPin size={18} />
                  <span>Fazenda Provisão, ás 9:30</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-photo-wrapper animate-fade-in delay-2">
            <div className="hero-photo-inner">
              <img src="/capa.jpg" alt="Gabrielle & Guilherme" className="hero-photo" />
            </div>
          </div>
        </div>
      </header>

      <section className="section" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="text-center mb-4 animate-fade-in delay-2">
            <p className="hero-verse" style={{ margin: '0 auto', color: 'var(--primary-dark)', textShadow: 'none' }}>
              "Foi o Senhor que fez isto, e é coisa maravilhosa aos nossos olhos"
              <span className="hero-verse-ref" style={{ color: 'var(--text-light)', textShadow: 'none' }}>Salmos 118:23</span>
            </p>
          </div>
          <div className="card animate-fade-in delay-3" style={{ transform: 'translateY(-20px)' }}>
            <h2 className="text-center mb-4">Confirme sua Presença</h2>
            <p className="text-center mb-4" style={{ color: 'var(--text-light)' }}>
              Por favor, confirme sua presença para nos ajudar com a organização.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Seu nome completo"
                />
              </div>





              <div className="form-group">
                <label className="form-label">Mensagem aos Noivos (Opcional)</label>
                <textarea 
                  className="form-control" 
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  placeholder="Deixe uma mensagem com carinho..."
                ></textarea>
              </div>

              <div className="text-center mt-4">
                <button type="submit" className="btn" style={{ width: '100%' }}>
                  <Check size={20} />
                  Enviar Confirmação
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>



      <footer style={{ backgroundColor: 'var(--primary-dark)', color: 'var(--white)', padding: '3rem 0', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', marginBottom: '0.5rem' }}>G & G</p>
        <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>12 de Julho de 2026 • Esperamos você!</p>
        <div style={{ marginTop: '2rem' }}>
          <a href="/admin" style={{ opacity: 0.5, fontSize: '0.8rem', textDecoration: 'underline' }}>Acesso dos Noivos</a>
        </div>
      </footer>

      {/* Floating Gift Button */}
      <a 
        href="https://enxovalgeg.vercel.app/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fab-gift-container"
      >
        <div className="fab-gift-pulse"></div>
        <div className="fab-gift">
          <Gift size={20} />
          <span>Deseja nos presentear?</span>
        </div>
      </a>
    </main>
  );
}
