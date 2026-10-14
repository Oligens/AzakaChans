import { InformationPage } from '../components/InformationPage';
import { Link } from 'react-router-dom';
import { AlertTriangle, Shield, Heart, Phone } from 'lucide-react';

export function ResponsibleGamingPage() {
  return (
    <InformationPage 
      title="Jeu responsable" 
      subtitle="Jouer doit rester un divertissement"
    >
      <div className="space-y-8">
        {/* Introduction */}
        <div className="p-6 rounded-xl" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Chez AZAKA CHANS, nous nous engageons à promouvoir le jeu responsable. Les jeux d'argent doivent 
            être considérés comme une forme de divertissement et non comme un moyen de gagner de l'argent ou 
            de résoudre des problèmes financiers.
          </p>
        </div>

        {/* Jouez avec modération */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
              <Shield className="w-5 h-5" style={{ color: '#D4AF37' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#F5F0E6' }}>Jouez avec modération</h2>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#AAB7C9' }}>
            Le jeu doit rester une activité plaisante et contrôlée. Voici quelques principes essentiels :
          </p>
          <ul className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
            <li>• Considérez le jeu comme un divertissement, pas comme un investissement</li>
            <li>• Acceptez que perdre fait partie du jeu</li>
            <li>• Ne jouez jamais plus que ce que vous pouvez vous permettre de perdre</li>
            <li>• Fixez-vous des limites de temps et d'argent avant de commencer</li>
            <li>• Ne jouez pas sous le coup de l'émotion ou de la frustration</li>
          </ul>
        </section>

        {/* Fixez vos limites */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
              <Heart className="w-5 h-5" style={{ color: '#D4AF37' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#F5F0E6' }}>Fixez vos limites</h2>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#AAB7C9' }}>
            Avant de jouer, définissez des limites claires et respectez-les :
          </p>
          <div className="space-y-3">
            <LimitCard 
              title="Budget" 
              description="Déterminez un montant maximum que vous êtes prêt à dépenser par semaine ou par mois. Ne dépassez jamais ce budget."
            />
            <LimitCard 
              title="Temps" 
              description="Limitez le temps que vous passez à jouer. Prenez des pauses régulières et ne laissez pas le jeu empiéter sur vos autres activités."
            />
            <LimitCard 
              title="Pertes" 
              description="Acceptez vos pertes et ne tentez pas de les récupérer en jouant davantage. C'est le piège classique de la poursuite des pertes."
            />
            <LimitCard 
              title="Gains" 
              description="Si vous gagnez, résistez à la tentation de tout rejouer. Fixez-vous un objectif de gain et arrêtez-vous lorsque vous l'atteignez."
            />
          </div>
        </section>

        {/* Ne jouez pas avec de l'argent nécessaire */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <AlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#F5F0E6' }}>Ne jouez jamais avec de l'argent nécessaire</h2>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#AAB7C9' }}>
            Ne jouez jamais avec de l'argent destiné à :
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <WarningItem text="Loyer ou hypothèque" />
            <WarningItem text="Nourriture et alimentation" />
            <WarningItem text="Frais de scolarité" />
            <WarningItem text="Soins médicaux" />
            <WarningItem text="Remboursement de dettes" />
            <WarningItem text="Dépenses essentielles du quotidien" />
            <WarningItem text="Épargne d'urgence" />
            <WarningItem text="Investissements à long terme" />
          </div>
        </section>

        {/* Signes d'un comportement problématique */}
        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#F5F0E6' }}>
            Signes d'un comportement problématique
          </h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#AAB7C9' }}>
            Si vous reconnaissez un ou plusieurs de ces signes chez vous ou chez un proche, il est peut-être 
            temps de demander de l'aide :
          </p>
          <div className="space-y-3">
            <WarningSign text="Vous jouez plus longtemps ou plus souvent que prévu" />
            <WarningSign text="Vous dépensez plus d'argent que vous ne pouvez vous permettre" />
            <WarningSign text="Vous cachez vos habitudes de jeu à votre famille ou vos amis" />
            <WarningSign text="Vous poursuivez vos pertes en essayant de les récupérer" />
            <WarningSign text="Vous empruntez de l'argent pour jouer" />
            <WarningSign text="Vous ressentez une perte de contrôle sur votre jeu" />
            <WarningSign text="Le jeu affecte vos relations, votre travail ou vos études" />
            <WarningSign text="Vous vous sentez anxieux ou irrité lorsque vous ne jouez pas" />
            <WarningSign text="Vous mentez sur le temps ou l'argent consacré au jeu" />
          </div>
        </section>

        {/* Besoin d'aide */}
        <section>
          <div className="p-6 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-6 h-6" style={{ color: '#10B981' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#F5F0E6' }}>Besoin d'aide ?</h2>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#AAB7C9' }}>
              Si vous pensez avoir un problème de jeu, il est important de demander de l'aide. Vous n'êtes 
              pas seul et il existe des ressources pour vous soutenir.
            </p>
            <div className="space-y-3">
              <HelpResource 
                title="Parlez à quelqu'un de confiance" 
                description="Un ami, un membre de la famille ou un conseiller peut vous écouter et vous soutenir."
              />
              <HelpResource 
                title="Contactez un service professionnel" 
                description="Des organisations spécialisées offrent de l'aide et du soutien aux personnes ayant des problèmes de jeu."
              />
              <HelpResource 
                title="Utilisez nos outils d'auto-exclusion" 
                description="Vous pouvez demander à être temporairement ou définitivement exclu de la plateforme."
              />
            </div>
            <div className="mt-6">
              <Link to="/contact" className="btn-premium inline-flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Nous contacter
              </Link>
            </div>
          </div>
        </section>

        {/* Outils d'auto-exclusion */}
        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#F5F0E6' }}>Outils d'auto-exclusion</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#AAB7C9' }}>
            Si vous sentez que vous avez besoin de faire une pause, vous pouvez utiliser nos outils 
            d'auto-exclusion :
          </p>
          <ul className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
            <li>• <strong>Auto-exclusion temporaire</strong> : Bloquez votre compte pour une période définie (24h, 7 jours, 30 jours)</li>
            <li>• <strong>Limites de dépôt</strong> : Fixez des limites quotidiennes, hebdomadaires ou mensuelles</li>
            <li>• <strong>Rappels de réalité</strong> : Recevez des notifications sur le temps passé et l'argent dépensé</li>
            <li>• <strong>Auto-exclusion permanente</strong> : Bloquez définitivement votre compte</li>
          </ul>
          <p className="text-sm leading-relaxed mt-4" style={{ color: '#AAB7C9' }}>
            Pour utiliser ces outils, contactez notre support via la page Contact.
          </p>
        </section>

        {/* Note finale */}
        <div className="mt-12 p-6 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#EF4444' }} />
            <div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#F5F0E6' }}>
                Jouer comporte des risques
              </h3>
              <p className="text-sm" style={{ color: '#AAB7C9' }}>
                Endetement, dépendance, isolement... Si vous ou un proche avez besoin d'aide, 
                appelez le <strong style={{ color: '#D4AF37' }}>09 26 60 88 41</strong> (appel non surtaxé) 
                ou contactez-nous via la page Contact.
              </p>
            </div>
          </div>
        </div>
      </div>
    </InformationPage>
  );
}

function LimitCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 rounded-lg" style={{ background: 'rgba(11, 31, 58, 0.5)' }}>
      <h3 className="font-semibold mb-2" style={{ color: '#D4AF37' }}>{title}</h3>
      <p className="text-sm" style={{ color: '#AAB7C9' }}>{description}</p>
    </div>
  );
}

function WarningItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
      <div className="w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
      <span className="text-sm" style={{ color: '#AAB7C9' }}>{text}</span>
    </div>
  );
}

function WarningSign({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(11, 31, 58, 0.5)' }}>
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
      <span className="text-sm" style={{ color: '#AAB7C9' }}>{text}</span>
    </div>
  );
}

function HelpResource({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
      <h3 className="font-semibold mb-1" style={{ color: '#10B981' }}>{title}</h3>
      <p className="text-sm" style={{ color: '#AAB7C9' }}>{description}</p>
    </div>
  );
}
