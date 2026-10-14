import { Link } from 'react-router-dom';
import { InformationPage } from '../components/InformationPage';
import { User, Wallet, Ticket, HelpCircle, ChevronRight } from 'lucide-react';

export function HelpPage() {
  return (
    <InformationPage 
      title="Centre d'aide" 
      subtitle="Trouvez rapidement les réponses à vos questions"
    >
      <div className="space-y-8">
        {/* Compte */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
              <User className="w-5 h-5" style={{ color: '#D4AF37' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#F5F0E6' }}>Compte</h2>
          </div>
          <div className="space-y-3 ml-13">
            <HelpItem title="Création d'un compte">
              Pour créer un compte, cliquez sur "Commencer" depuis la page d'accueil et suivez les instructions. Vous devrez fournir une adresse email valide et créer un mot de passe sécurisé.
            </HelpItem>
            <HelpItem title="Connexion">
              Utilisez votre adresse email et votre mot de passe pour vous connecter. Si vous avez oublié votre mot de passe, utilisez le lien "Mot de passe oublié" sur la page de connexion.
            </HelpItem>
            <HelpItem title="Modification des informations">
              Vous pouvez modifier vos informations personnelles depuis votre profil. Accédez-y via le menu utilisateur après connexion.
            </HelpItem>
            <HelpItem title="Sécurité du compte">
              Nous recommandons d'utiliser un mot de passe fort et unique. Activez l'authentification à deux facteurs si disponible pour sécuriser davantage votre compte.
            </HelpItem>
          </div>
        </section>

        {/* Portefeuille */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
              <Wallet className="w-5 h-5" style={{ color: '#D4AF37' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#F5F0E6' }}>Portefeuille</h2>
          </div>
          <div className="space-y-3 ml-13">
            <HelpItem title="Comment déposer des fonds">
              Accédez à votre portefeuille et cliquez sur "Déposer". Choisissez votre méthode de paiement (MonCash ou NatCash) et suivez les instructions.
            </HelpItem>
            <HelpItem title="Comment vérifier un dépôt">
              Les dépôts sont généralement confirmés en quelques minutes. Vous pouvez vérifier le statut de votre dépôt dans l'historique des transactions de votre portefeuille.
            </HelpItem>
            <HelpItem title="Comment consulter son solde">
              Votre solde est affiché en haut de la page Portefeuille. Il est mis à jour en temps réel après chaque transaction.
            </HelpItem>
            <HelpItem title="Que faire lorsqu'un dépôt est en attente">
              Si votre dépôt reste en attente après 30 minutes, contactez notre support via la page Contact.
            </HelpItem>
          </div>
        </section>

        {/* Tickets */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
              <Ticket className="w-5 h-5" style={{ color: '#D4AF37' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#F5F0E6' }}>Tickets</h2>
          </div>
          <div className="space-y-3 ml-13">
            <HelpItem title="Comment acheter un ticket">
              Rendez-vous dans la Boutique, choisissez la catégorie de ticket souhaitée (50, 250, 500 ou 1 000 HTG), sélectionnez la quantité et confirmez l'achat.
            </HelpItem>
            <HelpItem title="Comment consulter ses tickets">
              Accédez à la page "Mes Tickets" depuis le menu. Vous y verrez tous vos tickets avec leur statut (à révéler, révélé, encaissé).
            </HelpItem>
            <HelpItem title="Comment vérifier un résultat">
              Cliquez sur un ticket dans la page "Mes Tickets" pour révéler son résultat. Les gains sont automatiquement crédités dans votre portefeuille.
            </HelpItem>
            <HelpItem title="Comment fonctionne un gain">
              Lorsqu'un ticket est gagnant, le montant est automatiquement ajouté à votre portefeuille. Vous pouvez ensuite le retirer via MonCash ou NatCash.
            </HelpItem>
          </div>
        </section>

        {/* Tirages */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
              <HelpCircle className="w-5 h-5" style={{ color: '#D4AF37' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#F5F0E6' }}>Tirages</h2>
          </div>
          <div className="space-y-3 ml-13">
            <HelpItem title="Fonctionnement des tirages">
              Les résultats des tickets sont déterminés de manière sécurisée avant la vente. Chaque ticket possède un résultat prédéterminé qui ne peut pas être modifié.
            </HelpItem>
            <HelpItem title="Publication des résultats">
              Les résultats sont révélés lorsque vous choisissez de révéler votre ticket. Le système vérifie l'authenticité du ticket et affiche le résultat.
            </HelpItem>
            <HelpItem title="Vérification des numéros">
              Chaque ticket possède un identifiant unique et un code secret. Ces éléments sont vérifiés par notre système pour garantir l'authenticité.
            </HelpItem>
            <HelpItem title="Historique des tirages">
              Vous pouvez consulter l'historique de tous vos tickets dans la page "Mes Tickets". L'historique inclut la date d'achat, le statut et les gains éventuels.
            </HelpItem>
          </div>
        </section>

        {/* Problèmes fréquents */}
        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#F5F0E6' }}>Problèmes fréquents</h2>
          <div className="space-y-3">
            <HelpItem title="Mon dépôt n'apparaît pas">
              Vérifiez que le paiement a bien été effectué. Si le problème persiste après 30 minutes, contactez notre support.
            </HelpItem>
            <HelpItem title="Je ne peux pas révéler mon ticket">
              Assurez-vous que vous êtes connecté et que le ticket vous appartient. Si le problème persiste, contactez notre support.
            </HelpItem>
            <HelpItem title="Mon gain n'a pas été crédité">
              Les gains sont généralement crédités instantanément. Si ce n'est pas le cas, vérifiez l'historique des transactions ou contactez notre support.
            </HelpItem>
          </div>
        </section>

        {/* Contact */}
        <div className="mt-12 p-6 rounded-xl" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <h3 className="text-xl font-bold mb-3" style={{ color: '#F5F0E6' }}>Besoin d'aide supplémentaire ?</h3>
          <p className="mb-4" style={{ color: '#AAB7C9' }}>
            Notre équipe est disponible pour vous aider. N'hésitez pas à nous contacter.
          </p>
          <Link to="/contact" className="btn-premium inline-flex items-center gap-2">
            Nous contacter
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </InformationPage>
  );
}

function HelpItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-lg" style={{ background: 'rgba(11, 31, 58, 0.5)' }}>
      <h3 className="font-semibold mb-2" style={{ color: '#D4AF37' }}>{title}</h3>
      <p className="text-sm" style={{ color: '#AAB7C9' }}>{children}</p>
    </div>
  );
}
